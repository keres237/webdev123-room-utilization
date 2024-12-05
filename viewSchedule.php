<?php
require_once '../tools/functions.php';
?>

<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="page-title-box">
                <h1 class="page-title">Room Schedule</h1>
            </div>
        </div>
    </div>
    <div class="modal-container"></div>
    <div class="row">
        <div class="col-12">
            <div class="card p-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="col-md-3">
                        <label for="room">Room Name:</label>
                        <select id="room" class="form-control">
                            <option value="">Select Room</option>
                            <?php
                            require_once '../classes/room.class.php';
                            $roomObj = new Room();
                            $rooms = $roomObj->showAllRooms();
                            
                            foreach ($rooms as $room) {
                                echo "<option value='" . $room['id'] . "'>" . $room['room_name'] . "</option>";
                            }
                            ?>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <button id="filter" class="btn btn-primary">Filter</button>
                    </div>
                </div>
        
                <div class="card-body p-1 pt-2">
                    <div class="table-responsive">
                        <table id="table-schedule" class="table table-centered table-bordered mb-0">
                            <thead>
                                <tr>
                                    <th>Schedule</th>
                                    <th>Monday</th>
                                    <th>Tuesday</th>
                                    <th>Wednesday</th>
                                    <th>Thursday</th>
                                    <th>Friday</th>
                                    <th>Saturday</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php
                                $timeSlots = [
                                    '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
                                    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
                                    '5:00 PM', '6:00 PM', '7:00 PM'
                                ];

                                foreach ($timeSlots as $time) {
                                    echo "<tr>";
                                    echo "<td class='time-slot'>$time</td>";
                                    for ($day = 1; $day <= 6; $day++) {
                                        echo "<td class='schedule-cell' data-time='$time' data-day='$day'></td>";
                                    }
                                    echo "</tr>";
                                }
                                ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.schedule-cell {
    background-color: #FFB6B6;
    padding: 10px;
    height: 80px;
    vertical-align: middle;
    text-align: center;
}

.time-slot {
    background-color: #fff;
    font-weight: bold;
    vertical-align: middle;
    text-align: center;
}

#table-schedule thead th {
    background-color: #8BA989;
    color: black;
    text-align: center;
    padding: 15px;
}

.subject {
    font-weight: bold;
    margin-bottom: 3px;
}

.section {
    font-size: 0.9em;
    margin-bottom: 3px;
}

.teacher {
    font-size: 0.85em;
    font-style: italic;
}
</style>

<!-- <script src="../js/schedule.js"></script> -->