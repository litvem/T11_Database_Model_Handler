# **T11 - Database Model Handler**

## **Descripton**


This component is connected to the Mongo database and it is the only component in this distributed system that will persist entries in it. It works in close collaboration with the [Booking validator](https://git.chalmers.se/courses/dit355/dit356-2022/t-11/t11-booking-validator), receiving bookings for dental appointments to be saved in the database, and the [Web application](https://git.chalmers.se/courses/dit355/dit356-2022/t-11/t11-web-application), publishing information about the dentist clinics. 


## **Responsibilities**

- Publish data about the dentist clinics, so that the web application can display their info on the website
- Persist new bookings in the database
    - Publish confirmation message if it was successful
    - Publish error message if it was unsuccessful

## **Data flow**

### **<ins>Input Data</ins>**

The **input data** of this component includes the bookings received by the booking validator and requests to send dentist clinic information to the web application. 

>Example Booking request
```
{
  "userid": 12345,
  "requestid": 13,
  "dentistid": 1,
  "issuance": 1602406766314,
  "date": "2020-12-14",
  "name": "Peter",
  "email": "example@mail.com"
}

```
### **<ins>Output Data</ins>**

The **output data** of this component is the information about the dentist clinics, booking confirmations and potential error messages in case the booking could not be persisted in the database. 
>Example Booking confirmation
```
{
    "userid": 12345,
    "requestid": 13,
    "time": 13.30,
}
```

## **Tools**

>  Eclipse Mosquitto broker <br>[Download here](https://mosquitto.org/download/)

>NodeJS <br>[Download here](https://nodejs.org/en/download/)

>Javascript IDE<br> Some alternatives: [Visual Studio Code](https://visualstudio.microsoft.com/downloads/) , [WebStorm](https://www.jetbrains.com/webstorm/download/)

>MongoDB<br> [Download here](https://www.mongodb.com/docs/manual/installation/)

### **<ins>SetUp</ins>**

| Description | Command |
|-------|---|
| Clone this repository | <ins>Option 1.</ins><br> Download as a zip file<br> <ins>Option 2.</ins><br>`git clone git@git.chalmers.se:courses/dit355/dit356-2022/t-11/t11-database-model-handler.git`|
| Open a terminal and navigate to the mosquitto root folder. On Windows the default path is: <br> `C:\Program Files\mosquitto` |  `mosquitto -c mosquitto.conf -v ` |
|Open the repo in javascript IDE and open the terminal in the IDE. Navigate to the server folder | `npm install` |

## Error-Handling
The Mosquitto broker is normally automatically running in the background when you install it. A common error is therefore, when trying to run the `mosquitto -c mosquitto.conf -v ` command, that it will say that an instance of the broker is already running, and the process will terminate. To fix this, got to services (on Windows) and stop the Mosquitto broker from there, and try the command again. 











