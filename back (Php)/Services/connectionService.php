<?php

class ConnectionService
{
    private static $conn;

    public static function connect()
    {
        if (!self::$conn) {
            try {

            //connect to database


            } catch (PDOException $e) {
                die("DB connection error: " . $e->getMessage());
            }
        }
        return self::$conn;
    }
}
