import { describe, test, expect, beforeAll, afterAll } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import db from "../src/db/db"
import { Role } from "../src/components/user"
import { Category, Product } from "../src/components/product"
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

const insertTheProduct = async (product : Product, PersonCookie : string) => {
    await request(app)
        .post(`${baseURL}/products`)
        .set({"Cookie" : PersonCookie})
        .send(product)
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
    quantity: 100,
};

const Okproduct2 = {
    sellingPrice: 102,
    model: "testmodel2",
    category: Category.SMARTPHONE,
    arrivalDate: "2024-01-02",
    details: "testdetails2",
    quantity: 102,
};

const futureDateProduct = {
    sellingPrice: 100,
    model: "testmodel",
    category: Category.APPLIANCE,
    arrivalDate: "2100-01-01",
    details: "testdetails",
    quantity: 4,
}

const pastDateProduct = {
    sellingPrice: 100,
    model: "testmodel",
    category: Category.SMARTPHONE,
    arrivalDate: "1200-01-01",
    details: "testdetails",
    quantity: 0,
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
            await insertTheProduct(Okproduct, ManagerCookie)

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

        test("It should return a 200 success code", async () => {
            await insertTheProduct(Okproduct, ManagerCookie)

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
        })

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
            .send({quantity : addQuantity, changeDate: futureDateProduct.arrivalDate})
            .expect(400);
        })

        test("It should return a 404 error code", async () => {
            await request(app)
            .patch(`${baseURL}/products/ciao/invalidator"`)
            .set({"Cookie" : ManagerCookie})
            .send({quantity : addQuantity})
            .expect(404);
        })

        test("It should return a 400 error code - New arrivalDate before old arrivalDate ", async () => {
            await insertTheProduct(Okproduct, ManagerCookie)

            await request(app)
            .patch(`${baseURL}/products/${Okproduct.model}`)
            .set({"Cookie" : ManagerCookie})
            .send({quantity : addQuantity, changeDate : pastDateProduct.arrivalDate})
            .expect(400);
        })
    })

    describe("PATCH products/:model/sell", () => {
        let sellQuantity = 5

        test("It should return a 200 success code and decrease the quantity of the product",async () => {
            await insertTheProduct(Okproduct, ManagerCookie)

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

        test("It should return a 400 error code - AfterCurrentDateError", async () => {
            await request(app)
            .patch(`${baseURL}/products/${Okproduct.model}/sell`)
            .set({"Cookie" : ManagerCookie})
            .send({quantity : sellQuantity, sellingDate : futureDateProduct.arrivalDate})
            .expect(400);
        })
        

        test("It should return a 400 error code - BeforeArrivalDateError", async () => {
            await insertTheProduct(Okproduct, ManagerCookie)

            await request(app)
            .patch(`${baseURL}/products/${Okproduct.model}/sell`)
            .set({"Cookie" : ManagerCookie})
            .send({quantity : sellQuantity, sellingDate : pastDateProduct.arrivalDate})
            .expect(400);
        })

        test("It should return a 404 error code - ProductNotFoundError", async () => {
            await request(app)
            .patch(`${baseURL}/products/invalid/sell`)
            .set({"Cookie" : ManagerCookie})
            .send({quantity : sellQuantity})
            .expect(404);
        })

        test("It should return a 409 error code - LowProductStockError", async() => {
            await insertTheProduct(Okproduct, ManagerCookie)

            await request(app)
            .patch(`${baseURL}/products/${Okproduct.model}/sell`)
            .set({"Cookie" : ManagerCookie})
            .send({quantity : sellQuantity + 100})
            .expect(409);
        })

        test("It should return a 409 error code - EmptyProductStockError", async() => {
            await insertTheProduct(pastDateProduct, ManagerCookie)

            await request(app)
            .patch(`${baseURL}/products/${pastDateProduct.model}/sell`)
            .set({"Cookie" : ManagerCookie})
            .send({quantity : sellQuantity })
            .expect(409);
            
        }) 

        test("It should return 401 error code - Unauthorized", async () => {
            await request(app)
            .patch(`${baseURL}/products/${Okproduct.model}/sell`)
            .set({"Cookie" : CustomerCookie})
            .send({quantity : sellQuantity})
            .expect(401);
        })
    })

    describe("GET /products",() => {

        test("It should return a 200 success code and the products", async() => {
            await insertTheProduct(Okproduct, ManagerCookie)
            await insertTheProduct(Okproduct2, ManagerCookie)

            let response = await request(app)
            .get(`${baseURL}/products`)
            .set({'Cookie' : ManagerCookie})
            .expect(200);

            expect(response.body).toEqual(expect.arrayContaining([Okproduct, Okproduct2]));
        });

        test("It should return a 200 success code and all the Smartphones", async() => {
            let grouping = "category";
            let category = "Smartphone";

            await insertTheProduct(Okproduct, ManagerCookie)
            await insertTheProduct(Okproduct2, ManagerCookie)

            let response = await request(app)
            .get(`${baseURL}/products`)
            .set({'Cookie' : ManagerCookie})
            .query({grouping,category})
            .expect(200);

            expect(response.body).toEqual(expect.arrayContaining([Okproduct, Okproduct2]));

        })

        test("It should return a 200 success code and testmodel1", async() => {
            let grouping = "model";
            let model = "testmodel";

            await insertTheProduct(Okproduct, ManagerCookie)

            let response = await request(app)
            .get(`${baseURL}/products`)
            .set({'Cookie' : ManagerCookie})
            .query({grouping,model})
            .expect(200);

            expect(response.body).toEqual(expect.arrayContaining([Okproduct]));
        })

        /*test ("It should return a 422 error code - grouping = model but category is not null", async() => {
            let category = Category.SMARTPHONE
            let model = "testmodel"

            await request(app)
            .get(`${baseURL}/products`)
            .set({'Cookie' : ManagerCookie})
            .query({grouping : "model", category : category, model : model})
            .expect(422);
        })*/
    })
})