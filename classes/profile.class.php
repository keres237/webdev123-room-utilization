<?php

require_once 'database.class.php';

class Room{
    public $id = '';

    public $room_code = '';


    //room_list
    public $room_id = '';
    public $room_name = '';
    public $room_type = '';
    public $room_no = '';

    protected $db;

    function __construct(){
        $this->db = new Database();
    }




    function showAll($keyword = '', $category = ''){
        $query = "SELECT id, first_name, last_name, username, email, role,
                CASE 
                    WHEN is_active = 1 THEN 'Active'
                    ELSE 'Inactive'
                END as status
              FROM account 
              WHERE id = ?";
        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':keyword', $keyword);    
        $query->bindParam(':category', $category);
        $data = null;
        if ($query->execute()) {
            $data = $query->fetchAll();
        }
        return $data;
    }
    
    function showAllrooms(){
        $sql = 
            "SELECT 
                r.id, room_name,
                CONCAT(rt.room_code, '-', rt.room_description) AS room_details
            FROM 
                room_list r
            LEFT JOIN
                room_type rt ON r.type_id = rt.id
            WHERE (CONCAT(rt.room_code, '-', rt.room_description) LIKE CONCAT('%', :room_name, '%')) 
            AND (:room_type = '' OR rt.room_code = :room_type);
        ";
        
        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':room_name', $this->room_name);
        $query->bindParam(':room_type', $this->room_type);
        
        $data = null;
        if ($query->execute()){
            $data = $query->fetchAll();
        }
        
        return $data;
    }

    
    function editRoom(){
        $sql = "UPDATE room_list SET room_name = :room_name, type_id = :room_type WHERE id = :room_id;";
        $query = $this->db->connect()->prepare($sql);   
        $query->bindParam(':room_name', $this->room_name);
        $query->bindParam(':room_type', $this->room_type);
        $query->bindParam(':room_id', $this->room_id);
        return $query->execute();
    }

    //fetch room list record
    function fetchroomlistRecord($recordID){
        $sql = "SELECT * FROM room_list WHERE id = :recordID;";
        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':recordID', $recordID);
        $data = null;
        if ($query->execute()) {
            $data = $query->fetch();
        }
        return $data;
    }


    function fetchRoomName($recordID){
        $sql = "SELECT room_name FROM room_list WHERE id = :recordID;";
        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':recordID', $recordID);
        $data = null;
        if ($query->execute()) {
            $data = $query->fetch();
        }
        return $data;
    }

    function delete($recordID){
        $sql = "DELETE FROM product WHERE id = :recordID;";
        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':recordID', $recordID);
        return $query->execute();
    }

    function roomnameExists($room_name, $excludeID = null){
        $sql = "SELECT COUNT(*) FROM room_list WHERE room_name = :room_name";
        if ($excludeID) {
            $sql .= " AND id != :excludeID";
        }
        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':room_name', $room_name);
        if ($excludeID) {
            $query->bindParam(':excludeID', $excludeID);
        }
        $query->execute();
        $count = $query->fetchColumn();
        return $count > 0;
    }
        
    function roomnameType(){
        $sql = "SELECT * FROM room_list 
        WHERE (
            (type_id = 1 AND room_name LIKE 'LR%') OR 
            (type_id = 2 AND room_name LIKE 'LAB%')
          
        );";
        
    }
    

    //fetch room type for dropdown
    public function fetchroomType(){
        $sql = 
            "SELECT id as type_id, CONCAT(room_code,' ',room_description) AS r_type 
            FROM room_type
            ORDER BY r_type ASC;
        
        ;";
        $query = $this->db->connect()->prepare($sql);
        $data = null;
        if ($query->execute()) {
            $data = $query->fetchAll(PDO::FETCH_ASSOC);
        }
        return $data;
    }

    //for filter dropdown, room_name in room list
    public function fetchroomList(){
        $sql = " SELECT * FROM room_list;";
        $query = $this->db->connect()->prepare($sql);
        $data = null;
        if ($query->execute()) {
            $data = $query->fetchAll(PDO::FETCH_ASSOC);
        }
        return $data;
    }

    
}
