CREATE TABLE `mall_stores` (
  `storeId`        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`           VARCHAR(255) NOT NULL,
  `add1`           VARCHAR(255) NOT NULL,
  `add2`           VARCHAR(255) NULL,
  `tel`            VARCHAR(20)  NULL,
  `result_y`       DECIMAL(10,7) NULL,
  `result_x`       DECIMAL(10,7) NULL,
  `createdAt`      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`storeId`),
  KEY `idx_name` (`name`),
  KEY `idx_add1` (`add1`),
  KEY `idx_coordinates` (`result_y`, `result_x`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;