import { describe, test, expect, beforeAll, afterAll } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import db from "../src/db/db"
import { Role } from "../src/components/user"
import { Category } from "../src/components/product"
import { ok } from "assert"

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

const postProduct = async(productInfo: any,cookieInfo: any)=>{
    await request(app)
    .post(baseURL + "/products")
    .set("Cookie",cookieInfo)
    .send(productInfo)
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

const testCustomer = {
    username: "testCustomerUsername",
    name: "testCustomerName",
    surname: "testCustomerSurname",
    password: "testCustomerPassword",
    role: Role.CUSTOMER,
    address: "testCustomerAddress",
    birthdate: "testCustomerBirthdate"
}

const Okproduct = {
    sellingPrice: 100,
    model: "testmodel",
    category: Category.SMARTPHONE,
    arrivalDate: "2024-01-01",
    details: "testdetails",
    quantity: 4,
};

const futureDateProduct = {
    sellingPrice: 100,
    model: "testmodel",
    category: "Laptop",
    arrivalDate: "2100-01-01",
    details: "testdetails",
    quantity: 4,
}

const pastDateProduct = {
    sellingPrice: 100,
    model: "testmodel",
    category: "Laptop",
    arrivalDate: "1200-01-01",
    details: "testdetails",
    quantity: 4,
}

let ManagerCookie : string;
let CustomerCookie : string;

beforeAll(async ()=>{
    await cleanup();
    await postUser(testCustomer)
    await postUser(testManager)
    CustomerCookie = await login(testCustomer)
    ManagerCookie = await login(testManager)
})

afterAll(async () => {
    cleanup()
})

describe("Product routes integration tests", () => {

    describe("POST /products", () => {
        
        test("It should return a 200 success code", async () => {
            // The manager insert a new product model in the db
            await request(app)
            .post(`${baseURL}/products`)
            .set({"Cookie" : ManagerCookie})
            .send(Okproduct)
            .expect(200);

            // The response status = 200 means the product is in the database
            let response = await request(app)
            .get(`${baseURL}/products`)
            .set({'Cookie' : ManagerCookie})
            .expect(200);
            expect(response.body).toHaveLength(1);

            let tprod = response.body.find((tprod : any) => tprod.model = Okproduct.model);
            expect(tprod.model).toBe(Okproduct.model);
            expect(tprod.sellingPrice).toBe(Okproduct.sellingPrice);
        })

        test("It should return a 401 error - Unauthorized", async () => {
            await request(app)
            .post(`${baseURL}/products`)
            .set({"Cookie" : CustomerCookie})
            .send(Okproduct)
            .expect(401);
        })

        test("It should return a 400 error - AfterCurrentDateError", async () => {
            await request(app)
            .post(`${baseURL}/products`)
            .set({"Cookie" : ManagerCookie})
            .send(futureDateProduct)
            .expect(400);   
        })

        test("It should return a 409 error - ProductAlreadyExistsError", async () => {
            await request(app)
            .post(`${baseURL}/products`)
            .set({"Cookie" : ManagerCookie})
            .send(Okproduct)
            .expect(409);
        })
    })

    describe("PATCH products/:model", () => {
        let addQuantity = 5

        /*test("It should return a 200 success code", async () => {
            await request(app)
            .patch(`${baseURL}/products/${Okproduct.model}`)
            .set({"Cookie" : ManagerCookie})
            .send({model: Okproduct.model, quantity : addQuantity, arrivalDate: ""})
            .expect(200);

            let response = await request(app)
            .get(`${baseURL}/products`)
            .set({"Cookie" : ManagerCookie})
            .expect(200);
            expect(response.body).toHaveLength(1);

            let prod = response.body.find((prod : any) => prod.model = Okproduct.model);
            expect(prod.quantity).toBe(Okproduct.quantity + addQuantity);
        })*/

        test("It should return 401 error code - Unathorized", async () => {
            await request(app)
            .patch(`${baseURL}/products/${Okproduct.model}`)
            .set({"Cookie" : CustomerCookie})
            .send({quantity : addQuantity})
            .expect(401);
        })

        test("It should return a 400 error code - AfterCurrentDateError", async () => {

            await request(app)
            .patch(`${baseURL}/products/${futureDateProduct.model}`)
            .set({"Cookie" : ManagerCookie})
            .send({model: futureDateProduct.model, quantity : addQuantity, changeDate: futureDateProduct.arrivalDate})
            .expect(400);
        })

        /*test("It should return a 404 error code", async () => {
            await request(app)
            .patch(`${baseURL}/products/${Okproduct.model}"invalidator"`)
            .set({"Cookie" : ManagerCookie})
            .send({model: Okproduct.model, quantity : addQuantity, changeDate: Okproduct.arrivalDate})
            .expect(404);
        })*/

        /*
        test("It should return a 400 error code - New arrivalDate before old arrivalDate ", async () => {
            await request(app)
            .patch(`${baseURL}/products/${pastDateProduct.model}`)
            .set({"Cookie" : ManagerCookie})
            .send({quantity : addQuantity, changeDate : pastDateProduct.arrivalDate})
            .expect(400);
        }) */
    })

    describe("PATCH products/:model/sell", () => {
        let sellQuantity = 5

        test("It should return a 200 success code and decrease the quantity of the product",async () => {
            await request(app)
            .patch(`${baseURL}/products/${Okproduct.model}/sell`)
            .set({"Cookie" : ManagerCookie})
            .send({model: Okproduct.model, quantity : sellQuantity, changeDate: Okproduct.arrivalDate})
            .expect(200);

            let response = await request(app)
            .get(`${baseURL}/products`)
            .set({'Cookie' : ManagerCookie})
            .expect(200);

            expect(response.body).toHaveLength(1);

            let prod = response.body.find((prod : any) => prod.model = Okproduct.model);
            expect(prod.quantity).toBe(Okproduct.quantity-sellQuantity);
        })
    })
    
})