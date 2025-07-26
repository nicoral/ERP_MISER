import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1753063900514 implements MigrationInterface {
    name = 'Migrations1753063900514'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."fuel_daily_control_status_enum" AS ENUM('OPEN', 'CLOSED', 'SIGNED_1', 'SIGNED_2', 'SIGNED_3', 'FINALIZED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "fuel_daily_control" ("firstSignature" text, "firstSignedBy" integer, "firstSignedAt" TIMESTAMP, "secondSignature" text, "secondSignedBy" integer, "secondSignedAt" TIMESTAMP, "thirdSignature" text, "thirdSignedBy" integer, "thirdSignedAt" TIMESTAMP, "fourthSignature" text, "fourthSignedBy" integer, "fourthSignedAt" TIMESTAMP, "rejectedReason" text, "rejectedBy" integer, "rejectedAt" TIMESTAMP, "id" SERIAL NOT NULL, "control_date" date NOT NULL, "status" "public"."fuel_daily_control_status_enum" NOT NULL DEFAULT 'OPEN', "opening_stock" numeric(10,2) NOT NULL, "closing_stock" numeric(10,2), "total_outputs" numeric(10,2) NOT NULL DEFAULT '0', "observations" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "warehouse_id" integer NOT NULL, CONSTRAINT "PK_8e9464da05c0c8c12cebb35b2f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."fuel_output_status_enum" AS ENUM('PENDING', 'SIGNED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "fuel_output" ("firstSignature" text, "firstSignedBy" integer, "firstSignedAt" TIMESTAMP, "secondSignature" text, "secondSignedBy" integer, "secondSignedAt" TIMESTAMP, "thirdSignature" text, "thirdSignedBy" integer, "thirdSignedAt" TIMESTAMP, "fourthSignature" text, "fourthSignedBy" integer, "fourthSignedAt" TIMESTAMP, "rejectedReason" text, "rejectedBy" integer, "rejectedAt" TIMESTAMP, "id" SERIAL NOT NULL, "quantity" numeric(10,2) NOT NULL, "vehicle_plate" character varying(100), "equipment_code" character varying(100), "destination" character varying(255), "observations" text, "status" "public"."fuel_output_status_enum" NOT NULL DEFAULT 'PENDING', "output_time" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "fuel_daily_control_id" integer NOT NULL, "registered_by_employee_id" integer NOT NULL, "operator_employee_id" integer, CONSTRAINT "PK_41fb559a70761e004a76ae5a104" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."fuel_stock_movement_movementtype_enum" AS ENUM('OPENING', 'OUTPUT', 'ADJUSTMENT', 'CLOSING')`);
        await queryRunner.query(`CREATE TABLE "fuel_stock_movement" ("id" SERIAL NOT NULL, "movementType" "public"."fuel_stock_movement_movementtype_enum" NOT NULL, "quantity" numeric(10,2) NOT NULL, "stock_before" numeric(10,2) NOT NULL, "stock_after" numeric(10,2) NOT NULL, "observations" text, "movement_date" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "warehouse_id" integer NOT NULL, "employee_id" integer, CONSTRAINT "PK_22f99ab204347ce4da715c05346" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "warehouse_fuel_stock" ("id" SERIAL NOT NULL, "current_stock" numeric(10,2) NOT NULL DEFAULT '0', "min_stock" numeric(10,2) NOT NULL DEFAULT '0', "max_stock" numeric(10,2) NOT NULL DEFAULT '0', "tank_capacity" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "warehouse_id" integer NOT NULL, CONSTRAINT "PK_a30ae9fec70a9e37dd463d775fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "fuel_daily_control" ADD CONSTRAINT "FK_6d7404862ecc4b962c1807439b2" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fuel_output" ADD CONSTRAINT "FK_ece62fde02fecdf8f58e303e5c1" FOREIGN KEY ("fuel_daily_control_id") REFERENCES "fuel_daily_control"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fuel_output" ADD CONSTRAINT "FK_22fb64654012a046a2716947497" FOREIGN KEY ("registered_by_employee_id") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fuel_output" ADD CONSTRAINT "FK_3218881d861edbc353f2bfd1823" FOREIGN KEY ("operator_employee_id") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fuel_stock_movement" ADD CONSTRAINT "FK_c6c5fcc86f6c2f0cedfd5269fe5" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fuel_stock_movement" ADD CONSTRAINT "FK_c75fc6a4af3f5b65f37599112b8" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "warehouse_fuel_stock" ADD CONSTRAINT "FK_1793a957431e5adc8e0924b3342" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "warehouse_fuel_stock" DROP CONSTRAINT "FK_1793a957431e5adc8e0924b3342"`);
        await queryRunner.query(`ALTER TABLE "fuel_stock_movement" DROP CONSTRAINT "FK_c75fc6a4af3f5b65f37599112b8"`);
        await queryRunner.query(`ALTER TABLE "fuel_stock_movement" DROP CONSTRAINT "FK_c6c5fcc86f6c2f0cedfd5269fe5"`);
        await queryRunner.query(`ALTER TABLE "fuel_output" DROP CONSTRAINT "FK_3218881d861edbc353f2bfd1823"`);
        await queryRunner.query(`ALTER TABLE "fuel_output" DROP CONSTRAINT "FK_22fb64654012a046a2716947497"`);
        await queryRunner.query(`ALTER TABLE "fuel_output" DROP CONSTRAINT "FK_ece62fde02fecdf8f58e303e5c1"`);
        await queryRunner.query(`ALTER TABLE "fuel_daily_control" DROP CONSTRAINT "FK_6d7404862ecc4b962c1807439b2"`);
        await queryRunner.query(`DROP TABLE "warehouse_fuel_stock"`);
        await queryRunner.query(`DROP TABLE "fuel_stock_movement"`);
        await queryRunner.query(`DROP TYPE "public"."fuel_stock_movement_movementtype_enum"`);
        await queryRunner.query(`DROP TABLE "fuel_output"`);
        await queryRunner.query(`DROP TYPE "public"."fuel_output_status_enum"`);
        await queryRunner.query(`DROP TABLE "fuel_daily_control"`);
        await queryRunner.query(`DROP TYPE "public"."fuel_daily_control_status_enum"`);
    }

}
