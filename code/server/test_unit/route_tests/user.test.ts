import { test, expect, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"
import {Role, User} from "../../src/components/user"
import Authenticator from "../../src/routers/auth"
import ErrorHandler from "../../src/helper"

import UserController from "../../src/controllers/userController"
const baseURL = "/ezelectronics"


jest.mock("../../src/components/user")
jest.mock("../../src/routers/auth")

jest.mock("express-validator", () =>{
    const fakeMiddleware = (req: any, res: any, next: any) => {return next()}
    const fakeValidator = () => fakeMiddleware

    fakeMiddleware.isString = fakeValidator
    fakeMiddleware.isLength = fakeValidator
    fakeMiddleware.isIn = fakeValidator
    fakeMiddleware.isDate = fakeValidator
    fakeMiddleware.isInt = fakeValidator
    fakeMiddleware.optional = fakeValidator
    fakeMiddleware.isFloat = fakeValidator

    return {
        
        param: jest.fn(()=>fakeMiddleware),
        body: jest.fn(()=>fakeMiddleware)
    }
})


jest.mock('../../src/helper', () => {
    const ErrorHandlerModule: any = jest.requireActual('../../src/helper');
    const ErrorHandler = ErrorHandlerModule.default
    ErrorHandler.prototype.validateRequest = jest.fn((req: any, res: any, next: any) => {return next()})
  
    return {
      __esModule: true,
      default: ErrorHandler
    };
});

const dummyMiddleware = (req: any, res: any, next: any) => {return next()}

beforeAll(()=>{
    jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {return next()})
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation(dummyMiddleware)
})

afterEach(()=>{
    //jest.resetAllMocks()
    jest.clearAllMocks()
})

describe("User Routes unit test", ()=>{

    const testCustomer = {
        username: "testCustomerUsername",
        name: "testCustomerName",
        surname: "testCustomerSurname",
        password: "testCustomerPassword",
        role: Role.CUSTOMER,
        address: "testCustomerAddress",
        birthdate: "testCustomerBirthdate"
    }

    const testCustomerUser = new User(testCustomer.username, testCustomer.name, testCustomer.surname, testCustomer.role, testCustomer.address, testCustomer.birthdate)

    const testAdmin = {
        username: "testAdminUsername",
        name: "testAdminName",
        surname: "testAdminSurname",
        password: "testAdminPassword",
        role: Role.ADMIN,
        address: "testAdminAddress",
        birthdate: "testAdminBirthdate"
    }


    
    describe("POST /users",()=>{

        const testUser = { //Define a test user object sent to the route
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: "Manager"
        }

        //Example of a unit test for the POST ezelectronics/users route
        //The test checks if the route returns a 200 success code
        //The test also expects the createUser method of the controller to be called once with the correct parameters
        test("It should return a 200 success code", async () => {
            jest.spyOn(UserController.prototype, "createUser").mockResolvedValueOnce(true) //Mock the createUser method of the controller
            const response = await request(app).post(baseURL + "/users").send(testUser) //Send a POST request to the route
            expect(response.status).toBe(200) //Check if the response status is 200
            expect(UserController.prototype.createUser).toHaveBeenCalledTimes(1) //Check if the createUser method has been called once
            //Check if the createUser method has been called with the correct parameters
            expect(UserController.prototype.createUser).toHaveBeenCalledWith(testUser.username,
                testUser.name,
                testUser.surname,
                testUser.password,
                testUser.role)
        })

        test("it should return 503 error code", async ()=>{

            jest.spyOn(UserController.prototype, "createUser").mockRejectedValue("error") //Mock the createUser method of the controller
            const response = await request(app).post(baseURL + "/users").send(testUser) //Send a POST request to the route
            expect(response.status).toBe(503)
            expect(UserController.prototype.createUser).toHaveBeenCalledTimes(1)

        })

    })

    
    describe("GET /users", ()=>{
        test("it should return 200 success code", async ()=>{

            jest.spyOn(UserController.prototype, "getUsers").mockResolvedValue([testCustomer])

            const response = await request(app).get(baseURL + "/users")
            expect(response.status).toBe(200)
            expect(response.body).toEqual([testCustomer])
            expect(UserController.prototype.getUsers).toHaveBeenCalledTimes(1)

        })

        test("it should return 503 error code", async ()=>{

            jest.spyOn(UserController.prototype, "getUsers").mockRejectedValue("error")

            const response = await request(app).get(baseURL + "/users")
            expect(response.status).toBe(503)
            expect(UserController.prototype.getUsers).toHaveBeenCalledTimes(1)

        })
    })

    describe("GET /users/:role", ()=>{

        test("it should return 200 success code", async ()=>{

            jest.spyOn(UserController.prototype, "getUsersByRole").mockResolvedValue([testCustomer])

            const response = await request(app).get(baseURL + "/users/roles/Customer")
            expect(response.status).toBe(200)
            expect(UserController.prototype.getUsersByRole).toHaveBeenCalledTimes(1)

        })

        test("it should return 503 error code", async ()=>{

            jest.spyOn(UserController.prototype, "getUsersByRole").mockRejectedValue("error")

            const response = await request(app).get(baseURL + "/users/roles/Customer")
            expect(response.status).toBe(503)
            expect(UserController.prototype.getUsersByRole).toHaveBeenCalledTimes(1)

        })
    })

    describe("GET /users/:username", ()=>{

        test("it should return 200 success code", async ()=>{

            jest.spyOn(UserController.prototype, "getUserByUsername").mockResolvedValue(testCustomer)

            const response = await request(app).get(baseURL + "/users/" + testCustomer.username)
            expect(response.status).toBe(200)
            expect(UserController.prototype.getUserByUsername).toHaveBeenCalledTimes(1)

        })

        test("it should return 503 error code", async ()=>{

            jest.spyOn(UserController.prototype, "getUserByUsername").mockRejectedValue("error")

            const response = await request(app).get(baseURL + "/users/" + testCustomer.username)
            expect(response.status).toBe(503)
            expect(UserController.prototype.getUserByUsername).toHaveBeenCalledTimes(1)

        })
    })

    describe("DELETE /users/:username", ()=>{

        test("it should return 200 success code", async ()=>{

            jest.spyOn(UserController.prototype, "deleteUser").mockResolvedValue(true)

            const response = await request(app).delete(baseURL + "/users/" + testCustomer.username)
            expect(response.status).toBe(200)
            expect(UserController.prototype.deleteUser).toHaveBeenCalledTimes(1)

        })

        test("it should return 503 error code", async ()=>{

            jest.spyOn(UserController.prototype, "deleteUser").mockRejectedValue("error")

            const response = await request(app).delete(baseURL + "/users/" + testCustomer.username)
            expect(response.status).toBe(503)
            expect(UserController.prototype.deleteUser).toHaveBeenCalledTimes(1)

        })
    })

    describe("DELETE /users/", ()=>{

        test("it should return 200 success code", async ()=>{

            jest.spyOn(UserController.prototype, "deleteAll").mockResolvedValue(true)

            const response = await request(app).delete(baseURL + "/users")
            expect(response.status).toBe(200)
            expect(UserController.prototype.deleteAll).toHaveBeenCalledTimes(1)

        })

        test("it should return 503 error code", async ()=>{

            jest.spyOn(UserController.prototype, "deleteAll").mockRejectedValue("error")

            const response = await request(app).delete(baseURL + "/users")
            expect(response.status).toBe(503)
            expect(UserController.prototype.deleteAll).toHaveBeenCalledTimes(1)

        })
    })

    describe("PATCH /users/:username", ()=>{
        

        test("it should return 200 success code", async ()=>{
            jest.spyOn(UserController.prototype, "updateUserInfo").mockResolvedValue(testCustomerUser)

            const response = await request(app).patch(baseURL + "/users/" + testCustomer.username)
            expect(response.status).toBe(200)
            expect(UserController.prototype.updateUserInfo).toHaveBeenCalledTimes(1)

        })

        test("it should return 503 error code", async ()=>{

            jest.spyOn(UserController.prototype, "updateUserInfo").mockRejectedValue("error")

            const response = await request(app).patch(baseURL + "/users/" + testCustomer.username).send(testCustomer)
            expect(response.status).toBe(503)
            expect(UserController.prototype.updateUserInfo).toHaveBeenCalledTimes(1)

        })
    })
        
})
