import { describe, test, expect, beforeAll, afterAll } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import db from "../src/db/db"
import { Role } from "../src/components/user"
import { Category } from "../src/components/product"
import { ok } from "assert"
import dayjs from "dayjs"

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
    quantity: 100,
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

        /*test("It should return a 200 success code and decrease the quantity of the product",async () => {
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
    */

        /*test("It should return a 400 error code - AfterCurrentDateError", async () => {
            await request(app)
            .patch(`${baseURL}/products/${Okproduct.model}/sell`)
            .set({"Cookie" : ManagerCookie})
            .send({quantity : sellQuantity, sellingDate : futureDateProduct.arrivalDate})
            .expect(400);
        })*/
        
/*
        test("It should return a 400 error code - BeforeArrivalDateError", async () => {

            await request(app)
            .patch(`${baseURL}/products/${Okproduct.model}/sell`)
            .set({"Cookie" : ManagerCookie})
            .send({quantity : sellQuantity, sellingDate : pastDateProduct})
            .expect(400);
        })*/

        test("It should return a 404 error code - ProductNotFoundError", async () => {
            await request(app)
            .patch(`${baseURL}/products/invalid/sell`)
            .set({"Cookie" : ManagerCookie})
            .send({quantity : sellQuantity})
            .expect(404);
        })

        test("It should return a 409 error code ( LowProductStockError )",async() => {
            await request(app)
            .post(`${baseURL}/products`)
            .set({"Cookie" : ManagerCookie})
            .send(futureDateProduct)
            .expect(200);

            await request(app)
            .patch(`${baseURL}/products/${futureDateProduct}/sell`)
            .set({"Cookie" : ManagerCookie})
            .send({quantity : futureDateProduct.quantity + sellQuantity})
            .expect(409);
        })
/*
        test("It should return a 409 error code ( EmptyProductStockError )",async() => {
            await request(app)
            .post(`${routePath}/products`)
            .set({"Cookie" : managerCookie})
            .send(TArray[2])
            .expect(200);

            await request(app)
            .patch(`${routePath}/products/${TArray[2].model}/sell`)
            .set({"Cookie" : managerCookie})
            .send({quantity : TArray[2].quantity })
            .expect(200);

            await request(app)
            .patch(`${routePath}/products/${TArray[2].model}/sell`)
            .set({"Cookie" : managerCookie})
            .send({quantity : sellQuantity})
            .expect(409);
            
        }) 

        test("It should return 401 error code ( Unauthorized )",async () => {
            await request(app)
            .patch(`${routePath}/products/${TArray[0].model}/sell`)
            .set({"Cookie" : customerCookie})
            .send({quantity : sellQuantity})
            .expect(401);
        })
    })

    describe("GET /products",() => {

        test("It should return a 200 success code and all the products in the database",async() => {
            //Inserisco il resto dei prodotti, ma prima li rimuovo tutti

            await request(app)
            .delete(`${routePath}/products`)
            .set({'Cookie' : managerCookie}).expect(200);
            

            for ( let prod of TArray){
                await request(app)
                .post(`${routePath}/products`)
                .set({"Cookie" : managerCookie})
                .send(prod);
            }

            let response = await request(app)
            .get(`${routePath}/products`)
            .set({'Cookie' : managerCookie})
            .expect(200);

            expect(response.body).toHaveLength(TArray.length);

            for( let i = 1; i < response.body.length; i++){
                expect(response.body[i]).toEqual(TArray[i]);
            }


        })

        test("It should return a 200 success code and all the Smartphone products",async() => {
           let grouping = "category";
           let category = "Smartphone";

            let response = await request(app)
            .get(`${routePath}/products`)
            .set({'Cookie' : managerCookie})
            .query({grouping,category})
            .expect(200);

            expect(response.body).toEqual(TArray.filter(p => p.category == category));

        })

        test("It should return a 200 success code and all the products labeled as TestModel1",async() => {
            let grouping = "model";
            let model= "TestModel1";

            let response = await request(app)
            .get(`${routePath}/products`)
            .set({'Cookie' : managerCookie})
            .query({grouping,model})
            .expect(200);

            expect(response.body).toEqual(TArray.filter(p => p.model == model));
        })

        test ("It should return a 422 error code (grouping is set to one parameter but the other one is not null)",async() => {
            let category = 'Smartphone'
            let model= "TestModel1";

            await request(app)
            .get(`${routePath}/products`)
            .set({'Cookie' : managerCookie})
            .query({grouping : "model",model,category})
            .expect(422);

            await request(app)
            .get(`${routePath}/products`)
            .set({'Cookie' : managerCookie})
            .query({grouping : "category",model,category})
            .expect(422);
            
        })

        test ("It should return a 422 error code (grouping is set to one parameter but the other one is not null)",async() => {
            let category = 'Smartphone'
            let model= "TestModel1";

            
            await request(app)
            .get(`${routePath}/products`)
            .set({'Cookie' : managerCookie})
            .query({category})
            .expect(422);
            
        })

        

        test ("It should return a 404 error code ",async() => {
            let category = 'Smartphone'
            let model= "TestModelNotExisting";
            let grouping = "model"

            await request(app)
            .get(`${routePath}/products`)
            .set({'Cookie' : managerCookie})
            .query({grouping ,model})
            .expect(404)
            
        })

        test("It should return 401 error code ( Unathorized )",async() => {
           
            await request(app)
            .get(`${routePath}/products`)
            .set({'Cookie' : customerCookie})
            .expect(401);

        })
    })

    describe("GET /products/available",() => {
        test("It should return a 200 success code and all the available products in the database",async() => {
            //Rendo i prodotti 2 e 3 non disponibili, sia nel db che nell'array di testing

            await request(app)
            .patch(`${routePath}/products/${TArray[2].model}/sell`)
            .set({"Cookie" : managerCookie})
            .send({quantity : TArray[2].quantity})
            .expect(200);

            await request(app)
            .patch(`${routePath}/products/${TArray[3].model}/sell`)
            .set({"Cookie" : managerCookie})
            .send({quantity : TArray[3].quantity})
            .expect(200);

            TArray[2].quantity = 0;
            TArray[3].quantity = 0;

            let response = await request(app)
            .get(`${routePath}/products/available`)
            .set({'Cookie' : managerCookie})
            .expect(200);
            expect(response.body).toEqual(TArray.filter(p => p.quantity != 0));


        })

        test("It should return a 200 success code and all the available Smartphone products",async() => {
           let grouping = "category";
           let category = "Smartphone";

            let response = await request(app)
            .get(`${routePath}/products/available`)
            .set({'Cookie' : managerCookie})
            .query({grouping,category})
            .expect(200);

            expect(response.body).toEqual(TArray.filter(p => p.quantity != 0 && p.category === 'Smartphone'));


        })

        test("It should return a 200 success code and all the products labeled as TestModel1",async() => {
            let grouping = "model";
            let model= "TestModel1";

            let response = await request(app)
            .get(`${routePath}/products/available`)
            .set({'Cookie' : managerCookie})
            .query({grouping,model})
            .expect(200);

            expect(response.body).toEqual(TArray.filter(p => p.model == model && p.quantity != 0));
        })

        test ("It should return a 422 error code (grouping is set to one parameter but the other one is not null)",async() => {
            let category = 'Smartphone'
            let model= "TestModel1";

            await request(app)
            .get(`${routePath}/products/available`)
            .set({'Cookie' : managerCookie})
            .query({grouping : "model",model,category})
            .expect(422);

            await request(app)
            .get(`${routePath}/products/available`)
            .set({'Cookie' : managerCookie})
            .query({grouping : "category",model,category})
            .expect(422);
            
        })

        test ("It should return a 404 error code ",async() => {
            let model= "TestModelNotExisting";
            let grouping = "model"

            await request(app)
            .get(`${routePath}/products/available`)
            .set({'Cookie' : managerCookie})
            .query({grouping ,model})
            .expect(404)
            
        })

        test("It should return 200 success code ( customer case )",async() => {
           
            let response = await request(app)
            .get(`${routePath}/products/available`)
            .set({'Cookie' : customerCookie})
            .expect(200);

        })
    })

    describe("DELETE /products/:model",() => {
        test("It should return a 200 success code and delete the first product in the test array from the database",async()=>{
            await request(app)
            .delete(`${routePath}/products/${TArray[0].model}`)
            .set({'Cookie' : managerCookie})
            .expect(200);

            let response = await request(app).get(`${routePath}/products/`).set({'Cookie' : managerCookie}).expect(200);
            expect(response.body).toEqual(TArray.slice(1));
        })

        test("It should return a 404 error code",async()=>{
            await request(app)
            .delete(`${routePath}/products/${TArray[0].model}`)
            .set({'Cookie' : managerCookie})
            .expect(404);
        })

        test("It should return 401 error code ( Unathorized )",async()=>{
            await request(app)
            .delete(`${routePath}/products/${TArray[0].model}`)
            .set({'Cookie' : customerCookie})
            .expect(401);
        })
    })

    describe("DELETE /products",() => {
        test("It should return a 200 ok code and delete all products in the database",async() => {
            await request(app)
            .delete(`${routePath}/products`)
            .set({'Cookie' : managerCookie})
            .expect(200);
        })

        test("It should return 401 error code ( Unathorized )",async() => {
            await request(app)
            .delete(`${routePath}/products`)
            .set({'Cookie' : customerCookie})
            .expect(401);
        */})
    
})