import { describe, test, expect, beforeAll, afterAll } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import { Role } from "../src/components/user"
import db from "../src/db/db"
import { resolve } from "path"
import { User } from "../src/components/user"
import { stringify } from "querystring"

const baseURL = "/ezelectronics"

function cleanup() {
    return new Promise((resolve, reject)=>{
        db.serialize(() => {
            // Delete all data from the database.
            db.run("DELETE FROM users", (err)=>{
                if(err)
                    reject(err)
                resolve(true)
            })
            //Add delete statements for other tables here
        })
    })
}

const postUser = async(userInfo: any)=>{
    await request(app)
    .post(baseURL + "/users")
    .send(userInfo)
    .expect(200)
}

const login = async(userInfo: any)=>{
    return new Promise<string>((resolve, reject)=>{
        request(app)
        .post(baseURL + "/sessions")
        .send(userInfo)
        .expect(200)
        .end((err, res)=>{
            if(err){
                reject(err)
            }
            resolve(res.header["set-cookie"][0])
        })
    })
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

const testAdminUser = new User(testAdmin.username,testAdmin.name,testAdmin.surname,testAdmin.role,null as any, null as any)

const testManager = {
    username: "testManagerUsername",
    name: "testManagerName",
    surname: "testManagerSurname",
    password: "testManagerPassword",
    role: Role.MANAGER,
    address: "testManagerAddress",
    birthdate: "testManagerBirthdate"
}

const testManagerUser = new User(testManager.username,testManager.name,testManager.surname,testManager.role,null as any, null as any)

const testCustomer = {
    username: "testCustomerUsername",
    name: "testCustomerName",
    surname: "testCustomerSurname",
    password: "testCustomerPassword",
    role: Role.CUSTOMER,
    address: "testCustomerAddress",
    birthdate: "testCustomerBirthdate"
}

const testCustomerUser = new User(testCustomer.username,testCustomer.name,testCustomer.surname,testCustomer.role,null as any, null as any)

let AdminCookie = ""
let CustomerCookie = ""
let ManagerCookie = ""

beforeAll(async ()=>{
    await cleanup()
    await postUser(testAdmin)
    AdminCookie = await login(testAdmin)
})

describe("User integration testing ", ()=>{
    describe("POST /users",()=>{

        test("valid request, should return 200 and save a new user in the db", async()=>{
            //verify testcustomer doesn't exist
            await request(app).get(baseURL + "/users/" + testCustomer.username).set("Cookie", AdminCookie).expect(404)

            //add testcustomer
            await request(app)
            .post(baseURL + "/users")
            .send(testCustomer)
            .expect(200)

            //verify testcustomer now exists with right values
            const {body}: any = await request(app)
                .get(baseURL + "/users/" + testCustomer.username)
                .set("Cookie", AdminCookie)
                .expect(200)

            expect(body).toBeDefined()
            expect(body.name).toBe(testCustomer.name)
            expect(body.surname).toBe(testCustomer.surname)
            expect(body.username).toBe(testCustomer.username)
            expect(body.role).toBe(testCustomer.role)
        })

        test("login as new added user, it should return 200", async ()=>{
            CustomerCookie = await login(testCustomer)
        })

        test("Add a Manager, it should return 200", async()=>{
            await postUser(testManager)
        })

        test("login as new added manager, it should return 200", async ()=>{
            ManagerCookie = await login(testManager)
        })

        test("invalid username, should return 422", async()=>{
            //empty
            await request(app)
            .post(baseURL + "/users")
            .send({...testCustomer, username:""})
            .expect(422)

            //not string 
            await request(app)
            .post(baseURL + "/users")
            .send({...testCustomer, username: 111})
            .expect(422)
        })

        test("invalid name, should return 422", async()=>{
            //empty
            await request(app)
            .post(baseURL + "/users")
            .send({...testCustomer, name:""})
            .expect(422)

            //not string 
            await request(app)
            .post(baseURL + "/users")
            .send({...testCustomer, name: 111})
            .expect(422)
        })

        test("invalid surname, should return 422", async()=>{
            //empty
            await request(app)
            .post(baseURL + "/users")
            .send({...testCustomer, surname:""})
            .expect(422)

            //not string 
            await request(app)
            .post(baseURL + "/users")
            .send({...testCustomer, surname: 111})
            .expect(422)
        })

        test("invalid password, should return 422", async()=>{
            //empty
            await request(app)
            .post(baseURL + "/users")
            .send({...testCustomer, password:""})
            .expect(422)

            //not string 
            await request(app)
            .post(baseURL + "/users")
            .send({...testCustomer, password: 111})
            .expect(422)
        })

        test("invalid role, should return 422", async()=>{
            //not in ["Customer", "Manager", "Admin"]
            await request(app)
            .post(baseURL + "/users")
            .send({...testCustomer, role:"Anonymous"})
            .expect(422)
        })

        test("try to post an existing user, should return 409", async()=>{
            //add testcustomer
            await request(app)
            .post(baseURL + "/users")
            .send(testCustomer)
            .expect(409)
        })
    })

    describe("GET /users",()=>{
        test("Acces route as admin, it should return all the existring useres", async()=>{
            const {body} = await request(app)
                                .get(baseURL + "/users")
                                .set("Cookie", AdminCookie)
                                .expect(200)
            
            //Verify response contains users registered untill now
            expect(body).toContainEqual(testAdminUser)
            expect(body).toContainEqual(testCustomerUser)
            expect(body).toContainEqual(testManagerUser)
        })

        test("Acces route as custumer, it should return 401", async()=>{
            const {body} = await request(app)
                                .get(baseURL + "/users")
                                .set("Cookie", CustomerCookie)
                                .expect(401)
        })

        test("Acces route as Manager, it should return 401", async()=>{
            const {body} = await request(app)
                                .get(baseURL + "/users")
                                .set("Cookie", ManagerCookie)
                                .expect(401)
        })
    })

    describe("GET /users/roles/:role",()=>{
        test("Acces route as admin, it should return all the existring useres of a specific role", async()=>{
            const {body} = await request(app)
                                .get(baseURL + "/users/roles/" + Role.ADMIN)
                                .set("Cookie", AdminCookie)
                                .expect(200)
            
            //Verify response contains users registered untill now
            expect(body).toContainEqual(testAdminUser)
            expect(body).not.toContainEqual(testCustomerUser)
            expect(body).not.toContainEqual(testManagerUser)
        })

        test("Invalid Role, it should return 422", async()=>{
            const {body} = await request(app)
                                .get(baseURL + "/users/roles/" + "Anonymous")
                                .set("Cookie", AdminCookie)
                                .expect(422)
        })

        test("Acces route as custumer, it should return 401", async()=>{
            const {body} = await request(app)
                                .get(baseURL + "/users/roles" + Role.CUSTOMER)
                                .set("Cookie", CustomerCookie)
                                .expect(401)
        })

        test("Acces route as manager, it should return 401", async()=>{
            const {body} = await request(app)
                                .get(baseURL + "/users/roles" + Role.MANAGER)
                                .set("Cookie", ManagerCookie)
                                .expect(401)
        })
    })

    describe("GET /users/username",()=>{
        test("invalid username, it should return 422", async()=>{
            //cant test, empty username in params couse an redirection
            //param are casted as string by default
        })
        
        test("access route as admin and request others own information, it should return 200", async()=>{
            const {body} = await request(app)
                                .get(baseURL + "/users/" + testAdminUser.username)
                                .set("Cookie", AdminCookie)
                                .expect(200)
                                
            //verify is the right user
            expect(body).toEqual(testAdminUser)
        })

        test("access route as customer and request others own information, it should return 200", async()=>{
            const {body} = await request(app)
                                .get(baseURL + "/users/" + testCustomerUser.username)
                                .set("Cookie", CustomerCookie)
                                .expect(200)
                                
            //verify is the right user
            expect(body).toEqual(testCustomerUser)
        })

        test("access route as manager and request others own information, it should return 200", async()=>{
            const {body} = await request(app)
                                .get(baseURL + "/users/" + testManagerUser.username)
                                .set("Cookie", ManagerCookie)
                                .expect(200)
                                
            //verify is the right user
            expect(body).toEqual(testManagerUser)
        })

        test("access route as admin and request others information it should return 200", async()=>{
            const {body} = await request(app)
                                .get(baseURL + "/users/" + testCustomerUser.username)
                                .set("Cookie", AdminCookie)
                                .expect(200)

            //verify is the right user
            expect(body).toEqual(testCustomerUser)
        })

        test("access route as customer and request others information it should return 401", async()=>{
            const {body} = await request(app)
                                .get(baseURL + "/users/" + testAdminUser.username)
                                .set("Cookie", CustomerCookie)
                                .expect(401)
        })

        test("access route as manager and request others information it should return 401", async()=>{
            const {body} = await request(app)
                                .get(baseURL + "/users/" + testAdminUser.username)
                                .set("Cookie", ManagerCookie)
                                .expect(401)
        })

        test("access route as admin and request non existing user it should return 404", async()=>{
            const {body} = await request(app)
                                .get(baseURL + "/users/" + "Anonymous")
                                .set("Cookie", AdminCookie)
                                .expect(404)
        })
    })

})