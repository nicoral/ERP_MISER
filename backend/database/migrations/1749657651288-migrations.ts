import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1749657651288 implements MigrationInterface {
    name = 'Migrations1749657651288'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."supplier_status_enum" AS ENUM('ACTIVE', 'BLACK_LIST', 'INACTIVE')`);
        await queryRunner.query(`CREATE TABLE "supplier" ("id" SERIAL NOT NULL, "ruc" character varying(100) NOT NULL, "business_name" character varying(100) NOT NULL, "address" character varying(100), "contact_person" character varying(100) NOT NULL, "mobile" character varying(100) NOT NULL, "email" character varying(100), "bank_account" character varying(100), "return_policy" boolean NOT NULL DEFAULT true, "rating" numeric(10,2) NOT NULL DEFAULT '50', "status" "public"."supplier_status_enum" NOT NULL DEFAULT 'ACTIVE', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2bc0d2cab6276144d2ff98a2828" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "article" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "unit_of_measure" character varying(100) NOT NULL, "code" character varying(100) NOT NULL, "line" character varying(100) NOT NULL, "shelf" character varying(100) NOT NULL, "type" character varying(100) NOT NULL, "rotation_classification" character varying(100) NOT NULL, "min_stock" integer NOT NULL, "max_stock" integer NOT NULL, "reorder_quantity" integer NOT NULL DEFAULT '0', "active" boolean NOT NULL DEFAULT true, "image_url" character varying(255), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_40808690eb7b915046558c0f81b" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "article"`);
        await queryRunner.query(`DROP TABLE "supplier"`);
        await queryRunner.query(`DROP TYPE "public"."supplier_status_enum"`);
    }

}
