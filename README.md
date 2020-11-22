# Grant Disbursement API

This is my submission for the take-home technical assessment for GovTech TAP.

## Prerequisites

- [Node.js](https://nodejs.org/en/download/)
- [MongoDB](https://www.mongodb.com/try/download/)
- [Postman](https://www.postman.com/downloads/) (For testing the API)

## Running the application

- Clone the repository, install dependencies.
```
cd [cloned repository folder]
npm init
```
- [Start MongoDB](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/#run-mongodb-community-edition-from-the-command-interpreter).
- [Optional]
  - [Create a new database](https://www.mongodb.com/basics/create-database) named `grantDB`.
  - Create 2 collections within the database,  `householdCollection` and `familyMemberCollection`.
  - Import sample data using [command prompt](https://docs.mongodb.com/guides/server/import/) or [MongoDB Compass](https://docs.mongodb.com/compass/master/import-export).
- Run the server.
```
node index
```
- Use Postman with `GET` request URL `http://localhost:8080/api`, it should return the following.
```
Homepage of Grant Disbursement API
```

## Household API

> GET api/household

Retrieves all households.

> GET api/household/[household_id]

Retrieves household with household_id.

> DELETE api/household/[household_id]

Removes household with household_id.

> POST api/household 

Adds a new household given the following key value pair in `x-www-form-urlencoded` of request body.

| Key         | Value                    |
|:------------|:-------------------------|
| housingType | HDB / Condomium / Landed |

## Family Member API

> GET api/familyMember

Retrieves all family members.

> GET api/familyMember/[family_member_id]

Retrieves family member with family_member_id.

> DELETE api/familyMember/[family_member_id]

Removes family member with family_member_id.

> POST api/familyMember

Adds a new family member given the following key value pair in `x-www-form-urlencoded` of request body.

`Note: spouse field must be an existing single family member within the same householdId`

| Key            | Value                           |
|:---------------|:--------------------------------|
| householdId    | MongoDB Id                      |
| name           | Any value                       |
| gender         | Male / Female                   |
| maritalStatus  | Single / Married                |
| spouse         | MongoDB Id                      |
| occupationType | Unemployed / Student / Employed |
| annualIncome   | Non-negative numeric value      |
| dateOfBirth    | Past date, yyyy-mm-dd format    |

## Grant API

> GET api/studentEncouragementBonus

Retrieves students under 16 years old, with household income of less than $150,000.

> GET api/familyTogethernessScheme

Retrieves households with married adults and children under 18 years old.

> GET api/elderBonus

Retrieves elderly family members that are more than 50 years old.

> GET api/babySunshineGrant

Retrieves children family members that are less than 5 years old.

> GET api/yoloGstGrant

Retrieves households with household income of less than $100,000.

## Assumptions 

- No restrictions of adding more fields to either household or family members.
- Allowing to impose rule that spouses must be in the same household.
- Children under 18 do not need parents / guardians in a household.
- Children can have postive annual income.
