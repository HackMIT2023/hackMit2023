DROP DATABASE IF EXISTS GardenApp;
CREATE DATABASE GardenApp;
USE GardenApp;

DROP TABLE IF EXISTS PlantType;
DROP TABLE IF EXISTS Garden;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Plant;

CREATE TABLE Garden
(
    GardenID VARCHAR(36) PRIMARY KEY,
    GardenName VARCHAR(20) NOT NULL,
    JsonPolygon VARCHAR(255) NOT NULL
);

CREATE TABLE PlantType
(
    PlantTypeID VARCHAR(36) PRIMARY KEY,
    PlantName VARCHAR(20) NOT NULL,
    Frequency VARCHAR(50) NOT NULL,
    DaysPerWater INT NOT NULL
);

CREATE TABLE Users
(
    UserID VARCHAR(36) PRIMARY KEY,
    First_Name VARCHAR(20) NOT NULL,
    Last_Name VARCHAR(20) NOT NULL,
    Email VARCHAR(50) NOT NULL,
    GardenID VARCHAR(36) NOT NULL,
    FOREIGN KEY (GardenID) REFERENCES Garden(GardenID)
);

CREATE TABLE Plants
(
    PlantID VARCHAR(36) PRIMARY KEY,
    PlantTypeID VARCHAR(36) NOT NULL,
    LastWatered DATE NOT NULL,
    GardenID VARCHAR(36) NOT NULL,
    FOREIGN KEY (PlantTypeID) REFERENCES PlantType(PlantTypeID),
    FOREIGN KEY (GardenID) REFERENCES Garden(GardenID)
);

INSERT INTO Garden(GardenID, GardenName, JsonPolygon)
VALUES
    ('1', 'Garden1', '[[0,0],[0,.10],[.10,.10],[.10,0]]'),
    ('2', 'Garden2', '[[.10,.10],[.10,.20],[.20,.20],[.20,.10]]'),
    ('3', 'Garden3', '[[.20,.20],[.20,.30],[.30,.30],[.30,.20]]'),
    ('4', 'Garden4', '[[.30,.30],[.30,.40],[.40,.40],[.40,.30]]'),
    ('5', 'Garden5', '[[.40,.40],[.40,.50],[.50,.50],[.50,.40]]');

INSERT INTO PlantType(PlantTypeID, PlantName, Frequency, DaysPerWater)
VALUES
    ('1', 'Tomato', 'Daily', 1),
    ('2', 'Cucumber', 'Daily', 1),
    ('3', 'Carrot', 'Daily', 1),
    ('4', 'Potato', 'Daily', 1),
    ('5', 'Corn', 'Weekly', 7),
    ('6', 'Lettuce', 'Weekly', 7),
    ('7', 'Pepper', 'Weekly', 7),
    ('8', 'Onion', 'Weekly', 7),
    ('9', 'Radish', 'BiWeekly', 14),
    ('10', 'Pumpkin', 'BiWeekly', 14),
    ('11', 'Eggplant', 'BiWeekly', 14),
    ('12', 'Broccoli', 'BiWeekly', 14);

INSERT INTO Users(UserID, First_Name, Last_Name, Email, GardenID)
VALUES
    ('1', 'John', 'Smith', 'johnsmith@school.edu', '5'),
    ('2', 'Jane', 'Doe', 'jane@school.edu', '3'),
    ('3', 'Bob', 'Smith', 'bob@school.edu', '2'),
    ('4', 'Sally', 'Smith', 'sally@school.edu', '1'),
    ('5', 'Joe', 'Smith', 'joe@school.edu', '4');

INSERT INTO Plants(PlantID, PlantTypeID, LastWatered, GardenID)
VALUES
    ('1', '1', '2023-09-16', '1'),
    ('2', '1', '2023-09-15', '1'),
    ('3', '12', '2023-09-16', '1'),
    ('4', '2', '2023-09-15', '1'),
    ('5', '2', '2023-09-15', '1'),
    ('6', '3', '2023-09-15', '1'),
    ('7', '8', '2023-09-15', '1'),
    ('8', '9', '2023-09-15', '1'),
    ('9', '4', '2023-09-15', '1'),
    ('10', '11', '2023-09-14', '1'),
    ('11', '4', '2023-09-14', '1'),
    ('12', '10', '2023-09-13', '1'),
    --
    ('13', '1', '2023-09-16', '2'),
    ('14', '7', '2023-09-15', '2'),
    ('15', '6', '2023-09-16', '2'),
    ('16', '2', '2023-09-15', '2'),
    ('17', '5', '2023-09-15', '2'),
    ('18', '3', '2023-09-15', '2'),
    ('19', '4', '2023-09-15', '2'),
    --
    ('20', '1', '2023-09-16', '3'),
    ('21', '11', '2023-09-15', '3'),
    ('22', '12', '2023-09-16', '3'),
    --
    ('23', '1', '2023-09-16', '4'),
    ('24', '1', '2023-09-15', '4'),
    --
    ('25', '10', '2023-09-10', '5'),
    ('26', '10', '2023-09-11', '5'),
    ('27', '10', '2023-09-9', '5'),
    ('28', '10', '2023-09-8', '5'),
    ('29', '10', '2023-09-9', '5');

CREATE FUNCTION AddPlant(RandomPlantID VARCHAR(36), PlantType VARCHAR(36), DateWatered VARCHAR(36), GardenID VARCHAR(36))
RETURNS VARCHAR(36)
DETERMINISTIC
BEGIN
    INSERT INTO Plants(PlantID, PlantTypeID, LastWatered, GardenID) VALUES (RandomPlantID, PlantType, DateWatered, GardenID);
    RETURN RandomPlantID;
END;

CREATE FUNCTION Water(PlantIDToUpdate VARCHAR(36), DateWatered VARCHAR(36))
RETURNS VARCHAR(36)
DETERMINISTIC
BEGIN
    UPDATE Plants SET LastWatered = DateWatered WHERE PlantID = PlantIDToUpdate;
    RETURN PlantIDToUpdate;
END;

SELECT AddPlant('99', '12', '2023-09-14', '3');
SELECT Water('99', '2023-09-16');