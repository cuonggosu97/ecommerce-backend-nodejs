// CREATE PROCEDURE

CREATE DEFINER=`cuongpham`@`%` PROCEDURE `insert_data`()
BEGIN
   DECLARE max_id INT DEFAULT 1000000;
    DECLARE i INT DEFAULT 1;
    WHILE i <= max_id DO
        INSERT INTO  test_table (`id`, `name`, `age`, `address`) VALUES (i, CONCAT('name_', i), i, CONCAT('address_', i));
        SET i = i + 1;
    END WHILE;
END

CHANGE MASTER TO
MASTER_HOST='172.19.0.2',
MASTER_PORT=3306,
MASTER_USER='root',
MASTER_PASSWORD='cuongpham',
MASTER_LOG_FILE='mysql-bin.000001',
MASTER_LOG_POS=726,
MASTER_CONNECT_RETRY=60,
GET_MASTER_PUBLIC_KEY=1;

