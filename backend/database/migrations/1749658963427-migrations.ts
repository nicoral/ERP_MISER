import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1749658963427 implements MigrationInterface {
    name = 'Migrations1749658963427'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "warehouse" DROP CONSTRAINT "FK_9f7893d2776ef7013113cd94073"`);
        await queryRunner.query(`ALTER TABLE "warehouse" RENAME COLUMN "employeeId" TO "managerId"`);
        await queryRunner.query(`CREATE TABLE "employee_warehouses_assigned_warehouse" ("employeeId" integer NOT NULL, "warehouseId" integer NOT NULL, CONSTRAINT "PK_49727705c4bef016b960288272b" PRIMARY KEY ("employeeId", "warehouseId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_147092fb93ac3440431b7e995f" ON "employee_warehouses_assigned_warehouse" ("employeeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b375723c7a37b64aecf64e4e31" ON "employee_warehouses_assigned_warehouse" ("warehouseId") `);
        await queryRunner.query(`ALTER TABLE "warehouse" ADD CONSTRAINT "FK_365d11d960742455a78593b5784" FOREIGN KEY ("managerId") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_warehouses_assigned_warehouse" ADD CONSTRAINT "FK_147092fb93ac3440431b7e995f1" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "employee_warehouses_assigned_warehouse" ADD CONSTRAINT "FK_b375723c7a37b64aecf64e4e31a" FOREIGN KEY ("warehouseId") REFERENCES "warehouse"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee_warehouses_assigned_warehouse" DROP CONSTRAINT "FK_b375723c7a37b64aecf64e4e31a"`);
        await queryRunner.query(`ALTER TABLE "employee_warehouses_assigned_warehouse" DROP CONSTRAINT "FK_147092fb93ac3440431b7e995f1"`);
        await queryRunner.query(`ALTER TABLE "warehouse" DROP CONSTRAINT "FK_365d11d960742455a78593b5784"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b375723c7a37b64aecf64e4e31"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_147092fb93ac3440431b7e995f"`);
        await queryRunner.query(`DROP TABLE "employee_warehouses_assigned_warehouse"`);
        await queryRunner.query(`ALTER TABLE "warehouse" RENAME COLUMN "managerId" TO "employeeId"`);
        await queryRunner.query(`ALTER TABLE "warehouse" ADD CONSTRAINT "FK_9f7893d2776ef7013113cd94073" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
