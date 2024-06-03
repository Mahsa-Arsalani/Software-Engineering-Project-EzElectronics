import { test, expect, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"
import {Role, User} from "../../src/components/user"
import Authenticator from "../../src/routers/auth"
import ErrorHandler from "../../src/helper"

import UserController from "../../src/controllers/userController"
const baseURL = "/ezelectronics"

//jest.mock("../../src/helper")
jest.mock("../../src/components/user")
jest.mock("../../src/routers/auth")

afterEach(()=>{
    jest.resetAllMocks()
    jest.clearAllMocks()
})

describe("User Routs unit test", ()=>{

    const testCustomer = {
        username: "testCustomerUsername",
        name: "testCustomerName",
        surname: "testCustomerSurname",
        password: "testCustomerPassword",
        role: Role.CUSTOMER,
        address: "testCustomerAddress",
        birthdate: "testCustomerBirthdate"
    }

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
            expect(response.status).toBe(503) //Check if the response status is 200
            expect(UserController.prototype.createUser).toHaveBeenCalledTimes(1)

        })

    })
            
    describe("GET /users", ()=>{
        test("it should return 200 success code", async ()=>{

            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {return next()})
            jest.spyOn(UserController.prototype, "getUsers").mockResolvedValue([testCustomer])

            const response = await request(app).get(baseURL + "/users")
            expect(response.status).toBe(200)
            expect(UserController.prototype.getUsers).toHaveBeenCalledTimes(1)

        })

        test("it should return 503 error code", async ()=>{

            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {return next()})
            jest.spyOn(UserController.prototype, "getUsers").mockRejectedValue("error")

            const response = await request(app).get(baseURL + "/users")
            expect(response.status).toBe(503)
            expect(UserController.prototype.getUsers).toHaveBeenCalledTimes(1)

        })
    })

    describe("GET /users/:role", ()=>{

        
        jest.mock("express-validator", ()=>({
            body: jest.fn().mockImplementation(()=>({
                isString: ()=>({isLength: ()=>({}),
                                    isIn: ()=>({}),
                            })
            }))
        }))

        test("it should return 200 success code", async ()=>{

            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {return next()})
            //jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {return next()})
            jest.spyOn(UserController.prototype, "getUsersByRole").mockResolvedValue([testCustomer])

            const response = await request(app).get(baseURL + "/users/roles/Customer")
            expect(response.status).toBe(200)
            expect(UserController.prototype.getUsersByRole).toHaveBeenCalledTimes(1)

        })

        test("it should return 503 error code", async ()=>{

            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {return next()})
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {return next()})
            jest.spyOn(UserController.prototype, "getUsersByRole").mockRejectedValue("error")

            const response = await request(app).get(baseURL + "/users/roles/Customer")
            expect(response.status).toBe(503)
            expect(UserController.prototype.getUsersByRole).toHaveBeenCalledTimes(1)

        })
    })

})
