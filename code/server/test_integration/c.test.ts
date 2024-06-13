import { describe, test, expect, beforeAll, afterAll } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import db from "../src/db/db"
import { User, Role } from "../src/components/user"
import { Category, Product } from "../src/components/product"


const baseURL = "/ezelectronics"

function cleanup() {
    return new Promise((resolve, reject)=>{
        db.serialize(() => {
            db.run("DELETE FROM users", (err)=>{
                if(err)
                    reject(err)
                resolve(true)
            })
        })
        db.serialize(() => {
            db.run("DELETE FROM products", (err)=>{
                if(err)
                    reject(err)
                resolve(true)
            })
        })
        db.serialize(() => {
            db.run("DELETE FROM cart", (err)=>{
                if(err)
                    reject(err)
                resolve(true)
            })
        })
        db.serialize(() => {
            db.run("DELETE FROM reviews", (err)=>{
                if(err)
                    reject(err)
                resolve(true)
            })
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


const postProduct = async (productInfo: any, cookieInfo: any) => {
    await request(app)
        .post(baseURL + "/products")
        .set("Cookie", cookieInfo)
        .send(productInfo)
        .expect(200)
}

const logout = async (cookieInfo: any) => {
    await request(app)
        .delete(baseURL + "/sessions/current")
        .set("Cookie", cookieInfo)
        .expect(200)
}

const addtocart = async (cookieInfo: any) => {
    await request(app)
        .post(baseURL + "/carts")
        .set("Cookie", cookieInfo)
        .send({ model: "testmodel" })
        .expect(200)
}

const makepayment = async (cookieInfo: any) => {
    await request(app)
        .patch(baseURL + "/carts")
        .set("Cookie", cookieInfo)
        .expect(200)
}

const testManager = {
    username: "testManagerUsername",
    name: "testManagerName",
    surname: "testManagerSurname",
    password: "testManagerPassword",
    role: Role.MANAGER,
    address: "testManagerAddress",
    birthdate: "testManagerBirthdate"
}

const testproduct = {
    sellingPrice: 100,
    model: "testmodel",
    category: "Laptop",
    arrivalDate: "2024-06-12",
    details: "testdetails",
    quantity: 4,
};

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

let ManagerCookie = ""
let CustomerCookie = ""
let AdminCookie = ""

beforeAll(async () => {
    await cleanup();
})

describe("Cart integration testing ", () => {

    describe("scenario 1", () => {
        test("Add a product to the cart", async () => {
            await postUser(testManager)
            ManagerCookie = await login(testManager)
            await postProduct(testproduct, ManagerCookie)
            await logout(ManagerCookie)
            await postUser(testCustomer)
            CustomerCookie = await login(testCustomer)
            await addtocart(CustomerCookie)
            const cartResponse = await request(app)
                .get(baseURL + "/carts")
                .set("Cookie", CustomerCookie);
            expect(cartResponse.status).toBe(200);
            expect(cartResponse.body.products).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        model: "testmodel"
                    })
                ])
            );
        })
    })

    describe("scenario 2", () => {
        test("Make a payment for the items in the cart", async () => {
            await cleanup();
            await postUser(testManager)
            ManagerCookie = await login(testManager)
            await postProduct(testproduct, ManagerCookie)
            await logout(ManagerCookie)
            await postUser(testCustomer)
            CustomerCookie = await login(testCustomer)
            await addtocart(CustomerCookie)
            const cartResponse = await request(app)
                .get(baseURL + "/carts")
                .set("Cookie", CustomerCookie);
            expect(cartResponse.status).toBe(200);
            expect(cartResponse.body.products).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        model: "testmodel"
                    })
                ])
            );
            await makepayment(CustomerCookie)
        })
    })

    describe("scenario 3", () => {
        test("View the cart", async () => {
            await cleanup();
            await postUser(testManager)
            ManagerCookie = await login(testManager)
            await postProduct(testproduct, ManagerCookie)
            await logout(ManagerCookie)
            await postUser(testCustomer)
            CustomerCookie = await login(testCustomer)
            await addtocart(CustomerCookie)
            const cartResponse = await request(app)
                .get(baseURL + "/carts")
                .set("Cookie", CustomerCookie);
            expect(cartResponse.status).toBe(200);
            expect(cartResponse.body.products).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        model: "testmodel"
                    })
                ])
            );
        })
    })

})
