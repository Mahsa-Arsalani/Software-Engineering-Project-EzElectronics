# Test Report

<The goal of this document is to explain how the application was tested, detailing how the test cases were defined and what they cover>

# Contents

- [Test Report](#test-report)
- [Contents](#contents)
- [Dependency graph](#dependency-graph)
- [Integration approach](#integration-approach)
- [Tests](#tests)
- [Coverage](#coverage)
  - [Coverage of FR](#coverage-of-fr)
  - [Coverage white box](#coverage-white-box)

# Dependency graph

     <report the here the dependency graph of EzElectronics>

# Integration approach
<!--
    <Write here the integration sequence you adopted, in general terms (top down, bottom up, mixed) and as sequence

    (ex: step1: unit A, step 2: unit A+B, step 3: unit A+B+C, etc)>

    <Some steps may  correspond to unit testing (ex step1 in ex above)>

    <One step will  correspond to API testing, or testing unit route.js>
-->

    Step 1: Dao Unit tests
      Step 1.1: User Dao Unit tests
      Step 1.2: Product Dao Unit tests
      Step 1.3: Reviews Dao Unit tests
      Step 1.4: Cart Dao Unit tests
    Step 2: Controller Unit tests
      Step 2.1: User Controller Unit tests
      Step 2.2: Product Controller Unit tests
      Step 2.3: Reviews Controller Unit tests
      Step 2.4: Cart Controller Unit tests
    Step 3: Routes Unit tests
      Step 3.1: User Routes Unit tests
      Step 3.2: Product Routes Unit tests
      Step 3.3: Reviews Routes Unit tests
      Step 3.4: Cart Routes Unit tests
    Step 4: Integration tests
      Step 4.1 User Routes + User Controller + User Dao
      Step 4.2 Product Routes + Product Controller + Product Dao
      Step 4.3 Reviews Routes + Reviews Controller + Reviews Dao
      Step 4.4 Cart Routes + Cart Controller + Cart Dao

  The intermediate step Controller + Dao was avoided in the integration tests since most of the controllers simply called the DAO
  

# Tests

<in the table below list the test cases defined For each test report the object tested, the test level (API, integration, unit) and the technique used to define the test case (BB/ eq partitioning, BB/ boundary, WB/ statement coverage, etc)> <split the table if needed>

### ProductController unit testing
| Test case name | Object(s) tested | Test level | Technique used |
| :------------: | :--------------: | :--------: | :------------: |
| createProduct - It should return undefined        | ProductController | Unit       | BB/eq partitioning |
| createProduct - It should throw DateError         | ProductController | Unit       | BB/eq partitioning |
| createProduct - It should throw ProductAlreadyExistsError | ProductController | Unit       | BB/eq partitioning |
| changeProductQuantity - It should return 55       | ProductController | Unit       | BB/eq partitioning |
| changeProductQuantity - It should reject DateError 1 | ProductController | Unit       | BB/eq partitioning |
| changeProductQuantity - It should reject DateError 2 | ProductController | Unit       | BB/eq partitioning |
| changeProductQuantity - It should reject ProductNotFoundError | ProductController | Unit       | BB/eq partitioning |
| sellProduct - It should return 45                 | ProductController | Unit       | BB/eq partitioning |
| sellProduct - It should reject DateError          | ProductController | Unit       | BB/eq partitioning |
| sellProduct - It should reject LowProductStockError | ProductController | Unit       | BB/eq partitioning |
| sellProduct - It should reject EmptyProductStockError | ProductController | Unit       | BB/eq partitioning |
| getProducts - It should resolve to a list of three products | ProductController | Unit       | BB/eq partitioning |
| getProducts - It should resolve to a list of one product (grouped by model) | ProductController | Unit       | BB/eq partitioning |
| getProducts - It should resolve to a list of one product (grouped by category) | ProductController | Unit       | BB/eq partitioning |
| getProducts - group=model but model is null -> Error | ProductController | Unit       | BB/eq partitioning |
| getProducts - group=category but category is null -> Error | ProductController | Unit       | BB/eq partitioning |
| getProducts - group=model but category is not null -> Error | ProductController | Unit       | BB/eq partitioning |
| getProducts - group=category but model is not null -> Error | ProductController | Unit       | BB/eq partitioning |
| getAvailableProducts - It should resolve to a product list | ProductController | Unit       | BB/eq partitioning |
| getAvailableProducts - It should resolve to a list of one product (grouped by model) | ProductController | Unit       | BB/eq partitioning |
| getAvailableProducts - It should resolve to a list of one product (grouped by category) | ProductController | Unit       | BB/eq partitioning |
| getAvailableProducts - group=model but category is not null -> Error | ProductController | Unit       | BB/eq partitioning |
| getAvailableProducts - group=category but model is not null -> Error | ProductController | Unit       | BB/eq partitioning |
| getAvailableProducts - group=model but category is not null -> Error | ProductController | Unit       | BB/eq partitioning |
| getAvailableProducts - group=category but model is not null -> Error | ProductController | Unit       | BB/eq partitioning |
| deleteAllProducts - It should return true | ProductController | Unit       | BB/eq partitioning |
| deleteProduct - It should return true | ProductController | Unit       | BB/eq partitioning |

### ProductDAO unit testing
| Test case name | Object(s) tested | Test level | Technique used |
| :------------: | :--------------: | :--------: | :------------: |
| createProduct - It should return undefined | ProductDAO | Unit | BB/eq partitioning |
| createProduct - It should throw DateError | ProductDAO | Unit | BB/eq partitioning |
| createProduct - It should throw ProductAlreadyExistsError | ProductDAO | Unit | BB/eq partitioning |
| updateModel - It should return 55 | ProductDAO | Unit | BB/eq partitioning |
| updateModel - It should throw ProductNotFoundError | ProductDAO | Unit | BB/eq partitioning |
| updateModel - It should throw DateError | ProductDAO | Unit | BB/eq partitioning |
| sellModel - It should return 10 | ProductDAO | Unit | BB/eq partitioning |
| sellModel - It should throw ProductNotFoundError | ProductDAO | Unit | BB/eq partitioning |
| sellModel - It should throw DateError | ProductDAO | Unit | BB/eq partitioning |
| sellModel - It should throw EmptyProductStockError | ProductDAO | Unit | BB/eq partitioning |
| sellModel - It should throw LowProductStockError | ProductDAO | Unit | BB/eq partitioning |
| sellModel - It should throw generic Error | ProductDAO | Unit | BB/eq partitioning |
| getAllProducts - It should return a list of products | ProductDAO | Unit | BB/eq partitioning |
| getAllProducts - It should throw ProductNotFoundError | ProductDAO | Unit | BB/eq partitioning |
| getAllProducts - It should throw generic Error | ProductDAO | Unit | BB/eq partitioning |
| deleteAllProducts - It should throw generic Error | ProductDAO | Unit | BB/eq partitioning |
| deleteOneProduct - It should return true | ProductDAO | Unit | BB/eq partitioning |
| deleteOneProduct - It should throw generic Error | ProductDAO | Unit | BB/eq partitioning |
| getProductByModel - It should throw ProductNotFoundError | ProductDAO | Unit | BB/eq partitioning |
| getProductByModel - It should throw generic Error | ProductDAO | Unit | BB/eq partitioning |

### Route tests product

| Test case name | Object(s) tested | Test level | Technique used |
| :------------- | :--------------- | :--------- | :------------- |
| POST /products - It should return a 200 success code | ProductController | Integration | WB/statement coverage |
| POST /products - It should return a 409 error code | ProductController | Integration | WB/statement coverage |
| POST /products - It should return a 400 error code | ProductController | Integration | WB/statement coverage |
| PATCH /products/:model - It should return a 200 success code | ProductController | Integration | WB/statement coverage |
| PATCH /products/:model - It should return a 400 error code - new arrivalDate before the old one | ProductController | Integration | WB/statement coverage |
| PATCH /products/:model - It should return a 400 error code - arrivalDate is in the future | ProductController | Integration | WB/statement coverage |
| PATCH /products/:model - It should return a 404 error code - ProductNotFoundError | ProductController | Integration | WB/statement coverage |
| PATCH /products/:model/sell - It should return a 200 success code | ProductController | Integration | WB/statement coverage |
| PATCH /products/:model/sell - It should return a 404 error code - ProductNotFoundError | ProductController | Integration | WB/statement coverage |
| PATCH /products/:model/sell - It should return a 400 error code - DateError - sellingDate in the future | ProductController | Integration | WB/statement coverage |
| PATCH /products/:model/sell - It should return a 400 error code - DateError - sellingDate before the arrivalDate | ProductController | Integration | WB/statement coverage |
| PATCH /products/:model/sell - It should return a 409 error code - LowProductStockError | ProductController | Integration | WB/statement coverage |
| PATCH /products/:model/sell - It should return a 409 error code - EmptyProductStockError | ProductController | Integration | WB/statement coverage |
| GET /products - It should return a 200 success code | ProductController | Integration | WB/statement coverage |
| GET /products - It should return a 404 error code - ProductNotFoundError | ProductController | Integration | WB/statement coverage |
| GET /products - It should return a 422 error code - Grouping null but model and/or category not null | ProductController | Integration | WB/statement coverage |
| GET /products - It should return a 422 error code - Grouping = category but category null | ProductController | Integration | WB/statement coverage |
| GET /products/available - It should return a 200 success code | ProductController | Integration | WB/statement coverage |
| GET /products/available - It should return a 404 error code - ProductNotFoundError | ProductController | Integration | WB/statement coverage |
| GET /products/available - It should return a 422 error code - Grouping null but model and/or category not null | ProductController | Integration | WB/statement coverage |
| GET /products/available - It should return a 422 error code - Grouping = category but category null | ProductController | Integration | WB/statement coverage |
| DELETE /products/:model - It should return a 200 success code | ProductController | Integration | WB/statement coverage |
| DELETE /products/:model - It should return a 404 error code | ProductController | Integration | WB/statement coverage |
| DELETE /products - It should return a 200 success code | ProductController | Integration | WB/statement coverage |
| DELETE /products - It should return a 404 error code | ProductController | Integration | WB/statement coverage |

### Product routes integration tests
| Test case name | Object(s) tested | Test level | Technique used |
| :------------- | :--------------- | :--------- | :------------- |
| POST /products - It should return a 200 success code                   | ProductController  | Integration | BB/eq partitioning     |
| POST /products - It should return a 401 error - Unauthorized           | ProductController  | Integration | BB/eq partitioning     |
| POST /products - It should return a 400 error - AfterCurrentDateError  | ProductController  | Integration | BB/eq partitioning     |
| POST /products - It should return a 409 error - ProductAlreadyExistsError| ProductController| Integration | BB/eq partitioning     |
| PATCH /products/:model - It should return a 200 success code                   | ProductController  | Integration | BB/eq partitioning     |
| PATCH /products/:model - It should return a 401 error - Unauthorized           | ProductController  | Integration | BB/eq partitioning     |
| PATCH /products/:model - It should return a 400 error - AfterCurrentDateError  | ProductController  | Integration | BB/eq partitioning     |
| PATCH /products/:model - It should return a 404 error                          | ProductController  | Integration | BB/eq partitioning     |
| PATCH /products/:model - It should return a 400 error - New arrivalDate before old arrivalDate| ProductController | Integration | BB/eq partitioning     |
| PATCH /products/:model/sell - It should return a 200 success code and decrease quantity | ProductController| Integration | BB/eq partitioning     |
| PATCH /products/:model/sell - It should return a 400 error - AfterCurrentDateError  | ProductController  | Integration | BB/eq partitioning     |
| PATCH /products/:model/sell - It should return a 400 error - BeforeArrivalDateError | ProductController  | Integration | BB/eq partitioning     |
| PATCH /products/:model/sell - It should return a 404 error - ProductNotFoundError  | ProductController  | Integration | BB/eq partitioning     |
| PATCH /products/:model/sell - It should return a 409 error - LowProductStockError   | ProductController  | Integration | BB/eq partitioning     |
| PATCH /products/:model/sell - It should return a 409 error - EmptyProductStockError | ProductController  | Integration | BB/eq partitioning     |
| PATCH /products/:model/sell - It should return a 401 error - Unauthorized           | ProductController  | Integration | BB/eq partitioning     |
| GET /products - It should return a 200 success code and the products  | ProductController  | Integration | BB/eq partitioning     |
| GET /products - It should return a 200 success code and all the Smartphones| ProductController| Integration | BB/eq partitioning     |
| GET /products - It should return a 200 success code and the product    | ProductController  | Integration | BB/eq partitioning     |
| GET /products - It should return a 422 error code - grouping = model but category is not null| ProductController | Integration | BB/eq partitioning     |
| GET /products - It should return a 422 error code - grouping = category but category is null| ProductController | Integration | BB/eq partitioning     |
| GET /products - It should return a 404 error code                      | ProductController  | Integration | BB/eq partitioning     |
| GET /products - It should return a 401 error code - Unauthorized       | ProductController  | Integration | BB/eq partitioning     |
| GET /products/available - It should return a 200 success code and all the available Smartphone products| ProductController| Integration | BB/eq partitioning     |
| GET /products/available - It should return a 200 success code and testmodel      | ProductController  | Integration | BB/eq partitioning     |
| GET /products/available - It should return a 422 error code - grouping = category but category is null| ProductController | Integration | BB/eq partitioning     |
| GET /products/available - It should return a 404 error code                      | ProductController  | Integration | BB/eq partitioning     |
| DELETE /products/:model - It should return a 200 success code and delete okproduct| ProductController | Integration | BB/eq partitioning     |
| DELETE /products/:model - It should return a 404 error code                      | ProductController  | Integration | BB/eq partitioning     |
| DELETE /products/:model - It should return a 401 error code - Unauthorized       | ProductController  | Integration | BB/eq partitioning     |
| DELETE /products - It should return a 200 ok code and delete all products | ProductController  | Integration | BB/eq partitioning     |
| DELETE /products - It should return a 401 error code - Unauthorized       | ProductController  | Integration | BB/eq partitioning     |


# Coverage

## Coverage of FR
<!--
<Report in the following table the coverage of functional requirements and scenarios(from official requirements) >
-->

| Functional Requirement and scenarios  | Test(s) |
| :--------------------------------: | :-----: |
|**FR1.3 Create a new user account**| 7|
|Scenario 3.1 Registration| 1|
|Scenario 3.2 Username already in use| 1|
|Scenario 3.3 User provides empty parameters| 5|
| **FR2.1 Show the list of all users**             |     3    |
| **FR2.2 Show the list of all users with a specific role**                |     4    |
| **FR2.3 Show the information of a single user**             |    8     |
|Scenario 4.1 View the information of one user| 7|
|Scenario 4.2 Ask to view information of a user who does not exist| 1|
|Scenario 4.3 View the information of all users| 3|
|Scenario 4.4 View the information of all users with a specific role (Customer or Manager)| 3|
|Scenario 4.5 Ask to view information of users with a role that does not exist| 1|
| **FR2.4 Update the information of a single user**                 |   11      |
| **FR2.5 Delete a single non Admin user**                 |  6       |
| **FR2.6 Delete all non Admin users**                |     3    |




## Coverage white box

Report here the screenshot of coverage values obtained with jest-- coverage
