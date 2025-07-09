import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1752024583575 implements MigrationInterface {
    name = 'Migrations1752024583575'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "purchase_order" ("id" SERIAL NOT NULL, "code" character varying(50) NOT NULL, "orderNumber" character varying(100) NOT NULL, "issueDate" date NOT NULL, "buyerName" character varying(255) NOT NULL, "buyerRUC" character varying(20) NOT NULL, "buyerAddress" character varying(500) NOT NULL, "buyerLocation" character varying(255), "buyerPhone" character varying(50), "supplierName" character varying(200) NOT NULL, "supplierRUC" character varying(20) NOT NULL, "supplierAddress" character varying(500) NOT NULL, "supplierLocation" character varying(200), "supplierPhone" character varying(50), "items" jsonb NOT NULL, "paymentMethod" character varying(200), "deliveryDate" character varying(100) NOT NULL, "subtotal" numeric(15,2) NOT NULL, "igv" numeric(15,2), "total" numeric(15,2) NOT NULL, "currency" character varying(10) NOT NULL, "observation" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "quotation_request_id" integer NOT NULL, "supplier_id" integer NOT NULL, "created_by_id" integer, "requirement_id" integer, "cost_center_id" integer, CONSTRAINT "UQ_f96c29600a09115dd4f136ab41a" UNIQUE ("code"), CONSTRAINT "PK_05148947415204a897e8beb2553" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD CONSTRAINT "FK_ace1ddccb58fe6d09b673d0b0f3" FOREIGN KEY ("quotation_request_id") REFERENCES "quotation_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD CONSTRAINT "FK_d16a885aa88447ccfd010e739b0" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD CONSTRAINT "FK_1fdd0d65d22a9a9b3d43d7392d1" FOREIGN KEY ("created_by_id") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD CONSTRAINT "FK_c7c72ac243b02488e21c6e1ee4c" FOREIGN KEY ("requirement_id") REFERENCES "requirement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD CONSTRAINT "FK_790c68f2cf2b6c7f951dc49a6b9" FOREIGN KEY ("cost_center_id") REFERENCES "cost_center"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP CONSTRAINT "FK_790c68f2cf2b6c7f951dc49a6b9"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP CONSTRAINT "FK_c7c72ac243b02488e21c6e1ee4c"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP CONSTRAINT "FK_1fdd0d65d22a9a9b3d43d7392d1"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP CONSTRAINT "FK_d16a885aa88447ccfd010e739b0"`);
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP CONSTRAINT "FK_ace1ddccb58fe6d09b673d0b0f3"`);
        await queryRunner.query(`DROP TABLE "purchase_order"`);
    }

}
