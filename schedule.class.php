<?php
require_once 'database.php';

class Schedule {
    private $db;

    public function __construct() {
        $this->db = new Database();
    }

    // Function to get all schedules with related information
    public function showAllSchedules() {
        try {
            $sql = "SELECT 
                    cd.id,
                    rl.room_name,
                    sd.subject_code,
                    sd.description as subject_name,
                    CONCAT(a.first_name, ' ', a.last_name) as teacher_name,
                    ct.start_time,
                    ct.end_time,
                    GROUP_CONCAT(d.day ORDER BY d.id) as days
                FROM class_details cd
                JOIN room_list rl ON cd.room_id = rl.id
                JOIN subject_details sd ON cd.subject_id = sd.id
                JOIN faculty_list fl ON cd.teacher_assigned = fl.id
                JOIN account a ON fl.account_id = a.id
                JOIN class_time ct ON ct.class_id = cd.id
                JOIN class_day cday ON cday.class_time_id = ct.id
                JOIN _day d ON cday.day_id = d.id
                GROUP BY cd.id, rl.room_name, sd.subject_code, sd.description, 
                         a.first_name, a.last_name, ct.start_time, ct.end_time
                ORDER BY rl.room_name, ct.start_time";

            $stmt = $this->db->connect()->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    // Function to get schedule by ID
    public function getScheduleById($id) {
        try {
            $sql = "SELECT 
                    cd.id,
                    cd.room_id,
                    cd.subject_id,
                    cd.teacher_assigned,
                    cd.section_id,
                    rl.room_name,
                    sd.subject_code,
                    sd.description as subject_name,
                    CONCAT(a.first_name, ' ', a.last_name) as teacher_name,
                    ct.start_time,
                    ct.end_time,
                    GROUP_CONCAT(d.id) as day_ids,
                    GROUP_CONCAT(d.day) as days
                FROM class_details cd
                JOIN room_list rl ON cd.room_id = rl.id
                JOIN subject_details sd ON cd.subject_id = sd.id
                JOIN faculty_list fl ON cd.teacher_assigned = fl.id
                JOIN account a ON fl.account_id = a.id
                JOIN class_time ct ON ct.class_id = cd.id
                JOIN class_day cday ON cday.class_time_id = ct.id
                JOIN _day d ON cday.day_id = d.id
                WHERE cd.id = :id
                GROUP BY cd.id, rl.room_name, sd.subject_code, sd.description, 
                         a.first_name, a.last_name, ct.start_time, ct.end_time";

            $stmt = $this->db->connect()->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    // Function to update schedule
    public function updateSchedule($scheduleData) {
        try {
            $this->db->connect()->beginTransaction();

            // Update class_details
            $sql = "UPDATE class_details 
                   SET room_id = :room_id,
                       subject_id = :subject_id,
                       teacher_assigned = :teacher_id,
                       section_id = :section_id
                   WHERE id = :id";

            $stmt = $this->db->connect()->prepare($sql);
            $stmt->execute([
                ':id' => $scheduleData['id'],
                ':room_id' => $scheduleData['room_id'],
                ':subject_id' => $scheduleData['subject_id'],
                ':teacher_id' => $scheduleData['teacher_id'],
                ':section_id' => $scheduleData['section_id']
            ]);

            // Update class_time
            $sql = "UPDATE class_time 
                   SET start_time = :start_time,
                       end_time = :end_time
                   WHERE class_id = :class_id";

            $stmt = $this->db->connect()->prepare($sql);
            $stmt->execute([
                ':class_id' => $scheduleData['id'],
                ':start_time' => $scheduleData['start_time'],
                ':end_time' => $scheduleData['end_time']
            ]);

            // Update class_day
            // First delete existing days
            $sql = "DELETE cd FROM class_day cd
                   JOIN class_time ct ON cd.class_time_id = ct.id
                   WHERE ct.class_id = :class_id";

            $stmt = $this->db->connect()->prepare($sql);
            $stmt->execute([':class_id' => $scheduleData['id']]);

            // Then insert new days
            $sql = "INSERT INTO class_day (day_id, class_time_id) 
                   SELECT :day_id, ct.id 
                   FROM class_time ct 
                   WHERE ct.class_id = :class_id";

            $stmt = $this->db->connect()->prepare($sql);
            foreach ($scheduleData['days'] as $day_id) {
                $stmt->execute([
                    ':day_id' => $day_id,
                    ':class_id' => $scheduleData['id']
                ]);
            }

            $this->db->connect()->commit();
            return true;
        } catch (Exception $e) {
            $this->db->connect()->rollBack();
            error_log($e->getMessage());
            return false;
        }
    }

    // Function to get available rooms
    public function getAvailableRooms($day_id, $start_time, $end_time) {
        try {
            $sql = "SELECT DISTINCT rl.id, rl.room_name
                   FROM room_list rl
                   WHERE rl.id NOT IN (
                       SELECT cd.room_id
                       FROM class_details cd
                       JOIN class_time ct ON ct.class_id = cd.id
                       JOIN class_day cday ON cday.class_time_id = ct.id
                       WHERE cday.day_id = :day_id
                       AND (
                           (ct.start_time <= :start_time AND ct.end_time > :start_time)
                           OR (ct.start_time < :end_time AND ct.end_time >= :end_time)
                           OR (:start_time <= ct.start_time AND :end_time >= ct.end_time)
                       )
                   )
                   ORDER BY rl.room_name";

            $stmt = $this->db->connect()->prepare($sql);
            $stmt->execute([
                ':day_id' => $day_id,
                ':start_time' => $start_time,
                ':end_time' => $end_time
            ]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    // Function to check schedule conflicts
    public function checkScheduleConflict($room_id, $day_id, $start_time, $end_time, $exclude_id = null) {
        try {
            $sql = "SELECT COUNT(*) as conflict_count
                   FROM class_details cd
                   JOIN class_time ct ON ct.class_id = cd.id
                   JOIN class_day cday ON cday.class_time_id = ct.id
                   WHERE cd.room_id = :room_id
                   AND cday.day_id = :day_id
                   AND cd.id != COALESCE(:exclude_id, 0)
                   AND (
                       (ct.start_time <= :start_time AND ct.end_time > :start_time)
                       OR (ct.start_time < :end_time AND ct.end_time >= :end_time)
                       OR (:start_time <= ct.start_time AND :end_time >= ct.end_time)
                   )";

            $stmt = $this->db->connect()->prepare($sql);
            $stmt->execute([
                ':room_id' => $room_id,
                ':day_id' => $day_id,
                ':start_time' => $start_time,
                ':end_time' => $end_time,
                ':exclude_id' => $exclude_id
            ]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['conflict_count'] > 0;
        } catch (Exception $e) {
            error_log($e->getMessage());
            return true; // Return true to indicate potential conflict in case of error
        }
    }

    function viewSchedule($room_id = '') {
        $sql = "SELECT 
                cd.id,
                rl.room_name,
                sd.subject_code,
                sec.section_name,
                CONCAT(a.first_name, ' ', a.last_name) as teacher_name,
                ct.start_time,
                ct.end_time,
                cday.day_id
            FROM class_details cd
            JOIN room_list rl ON cd.room_id = rl.id
            JOIN subject_details sd ON cd.subject_id = sd.id
            JOIN section_details sec ON cd.section_id = sec.id
            JOIN faculty_list fl ON cd.teacher_assigned = fl.id
            JOIN account a ON fl.account_id = a.id
            JOIN class_time ct ON ct.class_id = cd.id
            JOIN class_day cday ON cday.class_time_id = ct.id";

        // Add room filter if room_id is provided
        if ($room_id) {
            $sql .= " WHERE cd.room_id = :room_id";
        }

        $sql .= " ORDER BY ct.start_time, cday.day_id";

        $query = $this->db->connect()->prepare($sql);
        
        if ($room_id) {
            $query->bindParam(':room_id', $room_id);
        }

        $data = null;
        if ($query->execute()) {
            $data = $query->fetchAll();
        }

        return $data;
    }

    // Helper function to get all rooms (for dropdown)
    function getAllRooms() {
        $sql = "SELECT id, room_name FROM room_list ORDER BY room_name";
        $query = $this->db->connect()->prepare($sql);
        
        $data = null;
        if ($query->execute()) {
            $data = $query->fetchAll();
        }

        return $data;
    }

    // Helper function to format schedule data for display
    function formatScheduleData($schedules) {
        $formatted = [];
        
        // Initialize time slots
        $timeSlots = [
            '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
            '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
            '5:00 PM', '6:00 PM', '7:00 PM'
        ];

        // Initialize days
        $days = [1, 2, 3, 4, 5, 6]; // Monday to Saturday

        // Create empty schedule grid
        foreach ($timeSlots as $time) {
            $formatted[$time] = [];
            foreach ($days as $day) {
                $formatted[$time][$day] = null;
            }
        }

        // Fill in schedule data
        foreach ($schedules as $schedule) {
            $timeSlot = date('g:i A', strtotime($schedule['start_time']));
            if (isset($formatted[$timeSlot][$schedule['day_id']])) {
                $formatted[$timeSlot][$schedule['day_id']] = [
                    'subject_code' => $schedule['subject_code'],
                    'section_name' => $schedule['section_name'],
                    'teacher_name' => $schedule['teacher_name']
                ];
            }
        }

        return $formatted;
    }
}
?>