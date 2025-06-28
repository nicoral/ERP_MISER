import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1750992180393 implements MigrationInterface {
    name = 'Migrations1750992180393'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "final_selection_item" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL, "unitPrice" numeric(15,4) NOT NULL, "totalPrice" numeric(15,2) NOT NULL, "currency" character varying NOT NULL DEFAULT 'PEN', "deliveryTime" integer, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "final_selection_id" integer, "requirement_article_id" integer, "supplier_id" integer, "supplier_quotation_item_id" integer, CONSTRAINT "PK_afdd81781a6b351fb1e6f63887f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."final_selection_status_enum" AS ENUM('DRAFT', 'APPROVED', 'GENERATED')`);
        await queryRunner.query(`CREATE TABLE "final_selection" ("id" SERIAL NOT NULL, "notes" text, "totalAmount" numeric(15,2) NOT NULL DEFAULT '0', "currency" character varying NOT NULL DEFAULT 'PEN', "status" "public"."final_selection_status_enum" NOT NULL DEFAULT 'DRAFT', "purchaseOrderNumber" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "quotation_request_id" integer, "created_by" integer, CONSTRAINT "PK_f36a1eac6841ffcb2c1403383ef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."quotation_request_status_enum" AS ENUM('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "quotation_request" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "status" "public"."quotation_request_status_enum" NOT NULL DEFAULT 'DRAFT', "deadline" date, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "requirement_id" integer, "created_by" integer, CONSTRAINT "UQ_929afa8c40d5b791376680b191a" UNIQUE ("code"), CONSTRAINT "PK_7f3c6238228cb519e5aecba5639" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "quotation_supplier_article" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "quotation_supplier_id" integer, "requirement_article_id" integer, CONSTRAINT "PK_2fa16902497858016355827b521" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."quotation_supplier_status_enum" AS ENUM('PENDING', 'SENT', 'RESPONDED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "quotation_supplier" ("id" SERIAL NOT NULL, "status" "public"."quotation_supplier_status_enum" NOT NULL DEFAULT 'PENDING', "orderNumber" character varying, "terms" text, "sentAt" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "quotation_request_id" integer, "supplier_id" integer, CONSTRAINT "PK_1068992dd2eefe5e67bb5ec4d5f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."supplier_quotation_status_enum" AS ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "supplier_quotation" ("id" SERIAL NOT NULL, "quotationNumber" character varying, "receivedAt" TIMESTAMP NOT NULL DEFAULT now(), "validUntil" date NOT NULL, "currency" character varying NOT NULL DEFAULT 'PEN', "totalAmount" numeric(15,2) NOT NULL DEFAULT '0', "status" "public"."supplier_quotation_status_enum" NOT NULL DEFAULT 'DRAFT', "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "quotation_supplier_id" integer, CONSTRAINT "REL_95b7e10c8e0d2d6f80174d3d40" UNIQUE ("quotation_supplier_id"), CONSTRAINT "PK_00301b29569f39002b5bcd8a77d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."supplier_quotation_item_status_enum" AS ENUM('QUOTED', 'NOT_AVAILABLE', 'NOT_QUOTED')`);
        await queryRunner.query(`CREATE TABLE "supplier_quotation_item" ("id" SERIAL NOT NULL, "status" "public"."supplier_quotation_item_status_enum" NOT NULL DEFAULT 'NOT_QUOTED', "quantity" integer, "unitPrice" numeric(15,4), "totalPrice" numeric(15,2), "currency" character varying NOT NULL DEFAULT 'PEN', "deliveryTime" integer, "notes" text, "reasonNotAvailable" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "supplier_quotation_id" integer, "requirement_article_id" integer, CONSTRAINT "PK_b7f1e732507fb484493e4c38422" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "final_selection_item" ADD CONSTRAINT "FK_d1ab1a81672e010c6ea9b0f3f5a" FOREIGN KEY ("final_selection_id") REFERENCES "final_selection"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "final_selection_item" ADD CONSTRAINT "FK_6b04ba1499cc3623bec0a61909a" FOREIGN KEY ("requirement_article_id") REFERENCES "requirement_article"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "final_selection_item" ADD CONSTRAINT "FK_3b430d54653d01b4c7b7a94acc6" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "final_selection_item" ADD CONSTRAINT "FK_bafe673161217f582317d463597" FOREIGN KEY ("supplier_quotation_item_id") REFERENCES "supplier_quotation_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "final_selection" ADD CONSTRAINT "FK_14a6a6f37721a1f12cd6f250191" FOREIGN KEY ("quotation_request_id") REFERENCES "quotation_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "final_selection" ADD CONSTRAINT "FK_87cc7a777caa8a3d30d293f0bd8" FOREIGN KEY ("created_by") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ADD CONSTRAINT "FK_c3f5947548f4dfbecdb337b1a0e" FOREIGN KEY ("requirement_id") REFERENCES "requirement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quotation_request" ADD CONSTRAINT "FK_feb70bd4059621b5a01195ba211" FOREIGN KEY ("created_by") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quotation_supplier_article" ADD CONSTRAINT "FK_3aa50720c0d823bc4425c93a054" FOREIGN KEY ("quotation_supplier_id") REFERENCES "quotation_supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quotation_supplier_article" ADD CONSTRAINT "FK_d8b3cbb7cc225a0b47c6ef5cda2" FOREIGN KEY ("requirement_article_id") REFERENCES "requirement_article"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quotation_supplier" ADD CONSTRAINT "FK_ed48fdac7ea01a54c99c1d61363" FOREIGN KEY ("quotation_request_id") REFERENCES "quotation_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quotation_supplier" ADD CONSTRAINT "FK_19ddaf80bc93802216a22233be3" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "supplier_quotation" ADD CONSTRAINT "FK_95b7e10c8e0d2d6f80174d3d400" FOREIGN KEY ("quotation_supplier_id") REFERENCES "quotation_supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "supplier_quotation_item" ADD CONSTRAINT "FK_af33893c28eed9b09fae1b4b8fc" FOREIGN KEY ("supplier_quotation_id") REFERENCES "supplier_quotation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "supplier_quotation_item" ADD CONSTRAINT "FK_4845153ed8155c3aa0f543d71a7" FOREIGN KEY ("requirement_article_id") REFERENCES "requirement_article"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier_quotation_item" DROP CONSTRAINT "FK_4845153ed8155c3aa0f543d71a7"`);
        await queryRunner.query(`ALTER TABLE "supplier_quotation_item" DROP CONSTRAINT "FK_af33893c28eed9b09fae1b4b8fc"`);
        await queryRunner.query(`ALTER TABLE "supplier_quotation" DROP CONSTRAINT "FK_95b7e10c8e0d2d6f80174d3d400"`);
        await queryRunner.query(`ALTER TABLE "quotation_supplier" DROP CONSTRAINT "FK_19ddaf80bc93802216a22233be3"`);
        await queryRunner.query(`ALTER TABLE "quotation_supplier" DROP CONSTRAINT "FK_ed48fdac7ea01a54c99c1d61363"`);
        await queryRunner.query(`ALTER TABLE "quotation_supplier_article" DROP CONSTRAINT "FK_d8b3cbb7cc225a0b47c6ef5cda2"`);
        await queryRunner.query(`ALTER TABLE "quotation_supplier_article" DROP CONSTRAINT "FK_3aa50720c0d823bc4425c93a054"`);
        await queryRunner.query(`ALTER TABLE "quotation_request" DROP CONSTRAINT "FK_feb70bd4059621b5a01195ba211"`);
        await queryRunner.query(`ALTER TABLE "quotation_request" DROP CONSTRAINT "FK_c3f5947548f4dfbecdb337b1a0e"`);
        await queryRunner.query(`ALTER TABLE "final_selection" DROP CONSTRAINT "FK_87cc7a777caa8a3d30d293f0bd8"`);
        await queryRunner.query(`ALTER TABLE "final_selection" DROP CONSTRAINT "FK_14a6a6f37721a1f12cd6f250191"`);
        await queryRunner.query(`ALTER TABLE "final_selection_item" DROP CONSTRAINT "FK_bafe673161217f582317d463597"`);
        await queryRunner.query(`ALTER TABLE "final_selection_item" DROP CONSTRAINT "FK_3b430d54653d01b4c7b7a94acc6"`);
        await queryRunner.query(`ALTER TABLE "final_selection_item" DROP CONSTRAINT "FK_6b04ba1499cc3623bec0a61909a"`);
        await queryRunner.query(`ALTER TABLE "final_selection_item" DROP CONSTRAINT "FK_d1ab1a81672e010c6ea9b0f3f5a"`);
        await queryRunner.query(`DROP TABLE "supplier_quotation_item"`);
        await queryRunner.query(`DROP TYPE "public"."supplier_quotation_item_status_enum"`);
        await queryRunner.query(`DROP TABLE "supplier_quotation"`);
        await queryRunner.query(`DROP TYPE "public"."supplier_quotation_status_enum"`);
        await queryRunner.query(`DROP TABLE "quotation_supplier"`);
        await queryRunner.query(`DROP TYPE "public"."quotation_supplier_status_enum"`);
        await queryRunner.query(`DROP TABLE "quotation_supplier_article"`);
        await queryRunner.query(`DROP TABLE "quotation_request"`);
        await queryRunner.query(`DROP TYPE "public"."quotation_request_status_enum"`);
        await queryRunner.query(`DROP TABLE "final_selection"`);
        await queryRunner.query(`DROP TYPE "public"."final_selection_status_enum"`);
        await queryRunner.query(`DROP TABLE "final_selection_item"`);
    }

}
