import db from "../db/db"
import { Product } from "../components/product"

/**
 * A class that implements the interaction with the database for all product-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */

class ProductDAO {

    /** 
     * It creates a new model in the products table. If the products table doesn't exist, it will create it and put the new model in. 
     * It doesn't return anything
    */
    newModel(model: string, category: string, quantity: number, details: string | null, sellingPrice: number, arrivalDate: string | null): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const createTableSql = 
                    `CREATE TABLE IF NOT EXISTS products (
                    model TEXT PRIMARY KEY,
                    category TEXT,
                    quantity INTEGER,
                    details TEXT,
                    sellingPrice REAL,
                    arrivalDate TEXT)`;
                this.runSql(createTableSql).then(() => {
                    const insertSql = "INSERT INTO products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES (?, ?, ?, ?, ?, ?)";
                    return this.runSql(insertSql, [model, category, quantity, details, sellingPrice, arrivalDate]);
                }).then(resolve).catch(err => {
                    reject(new Error(`Error in newModel: ${err.message}`));
                });
            } catch (err) {
                reject(new Error(`Error in newModel: ${err.message}`));
            }
        });
    }

    /** 
     * It update a model quantity and/or arrival date.
     * The number to use as quantity is not the new quantity but the increment to add to the old one.
     * It doens't return anything
    */
    updateModel(model: string, quantity: number, arrivalDate: string | null): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const sql = "UPDATE products SET quantity = quantity + ?, arrivalDate = ? WHERE model = ?";
                this.runSql(sql, [quantity, arrivalDate, model]).then(resolve).catch(err => {
                    reject(new Error(`Error in updateModel: ${err.message}`));
                });
            } catch (err) {
                reject(new Error(`Error in updateModel: ${err.message}`));
            }
        });
    }

    /** 
     * It allows to sell products. Model is the name of the model sold, quantity is the number of products sold, selling date is
     * the date when it happened the selling. If the selling date is null, the date used is the one of today.
     * It returns the number of product remainings
    */
    sellModel(model: string, quantity: number, sellingDate: string | null): Promise<number> {
        return new Promise((resolve, reject) => {
            try {
                const createProductsHistoryTableSql = 
                    `CREATE TABLE IF NOT EXISTS products_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    model TEXT,
                    quantity INTEGER,
                    sellingDate TEXT)`;
                this.runSql(createProductsHistoryTableSql).then(() => {
                    const updateSql = "UPDATE products SET quantity = quantity - ? WHERE model = ?";
                    return this.runSql(updateSql, [quantity, model]);
                }).then(() => {
                    const insertHistorySql = "INSERT INTO products_history (model, quantity, sellingDate) VALUES (?, ?, ?)";
                    return this.runSql(insertHistorySql, [model, quantity, sellingDate]);
                }).then(() => {
                    const getQuantitySql = "SELECT quantity FROM products WHERE model = ?";
                    return this.getSql(getQuantitySql, [model]);
                }).then(row => {
                    resolve(row.quantity);
                }).catch(err => {
                    reject(new Error(`Error in sellModel: ${err.message}`));
                });
            } catch (err) {
                reject(new Error(`Error in sellModel: ${err.message}`));
            }
        });
    }

    /** 
     * It gets all the products. They can be filtered by category (one between "Smartphone", "Laptop", "Appliance") or by model. If so,
     * "grouping" should be equal to the word "category" or "model"
    */
    getAllProducts(grouping: string | null, category: string | null, model: string | null): Promise<Product[]> {
        return new Promise((resolve, reject) => {
            try {
                let sql = "SELECT * FROM products";
                let param;

                if (grouping) {
                    if (grouping === "category" && category != null) {
                        sql += " WHERE category = ?";
                        param = [category];
                    } else if (grouping === "model" && model != null) {
                        sql += " WHERE model = ?";
                        param = [model];
                    }
                }

                this.allSql(sql, param).then(rows => {
                    resolve(rows);
                }).catch(err => {
                    reject(new Error(`Error in getAllProducts: ${err.message}`));
                });
            } catch (err) {
                reject(new Error(`Error in getAllProducts: ${err.message}`));
            }
        });
    }

    /**
     * Delete all the rows of the table: product, product_history
     */
    deleteAllProducts(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                const sqlDeleteProducts = "DELETE FROM products";
                this.runSql(sqlDeleteProducts).then(() => {
                    const sqlDeleteProductsHistory = "DELETE FROM products_history";
                    return this.runSql(sqlDeleteProductsHistory);
                }).then(() => {
                    resolve(true);
                }).catch(err => {
                    reject(new Error(`Error in deleteAllProducts: ${err.message}`));
                });
            } catch (err) {
                reject(new Error(`Error in deleteAllProducts: ${err.message}`));
            }
        });
    }

    /** 
     * It deletes a specific product from the products table based on the model.
     * It also deletes the corresponding entries from the products_history table.
     * It returns true if the operation is successful
    */
    deleteOneProduct(model: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                const sql = "DELETE FROM products WHERE model = ?";
                this.runSql(sql, [model]).then(() => {
                    const sqlHistory = "DELETE FROM products_history WHERE model = ?";
                    return this.runSql(sqlHistory, [model]);
                }).then(() => {
                    resolve(true);
                }).catch(err => {
                    reject(new Error(`Error in deleteOneProduct: ${err.message}`));
                });
            } catch (err) {
                reject(new Error(`Error in deleteOneProduct: ${err.message}`));
            }
        });
    }

    // It runs an SQL query that doesn't return anything (like insert, update, delete).
    private runSql(sql: string, params?: any[]): Promise<void> {
        return new Promise((resolve, reject) => {
            db.run(sql, params, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    // It runs an SQL query that returns a single row (used to get information by model, for ex.)
    private getSql(sql: string, params?: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // It runs an SQL query that returns all the rows queried
    private allSql(sql: string, params?: any[]): Promise<any[]> {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

export default ProductDAO;
