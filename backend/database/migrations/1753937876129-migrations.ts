import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1753937876129 implements MigrationInterface {
    name = 'Migrations1753937876129'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "document_approval_configuration" ("id" SERIAL NOT NULL, "entityType" character varying(50) NOT NULL, "entityId" integer NOT NULL, "signatureLevel" integer NOT NULL, "roleName" character varying(100) NOT NULL, "isRequired" boolean NOT NULL DEFAULT true, "isActive" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "updatedById" integer, CONSTRAINT "PK_c07daaa4f41ad9b57d874eea8c8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "approval_flow_template" ("id" SERIAL NOT NULL, "templateName" character varying(100) NOT NULL, "entityType" character varying(50) NOT NULL, "signatureLevel" integer NOT NULL, "roleName" character varying(100) NOT NULL, "isRequired" boolean NOT NULL DEFAULT true, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_97d3b02a4a10f68d9b02f379bc6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "general_settings" ADD "low_amount_threshold" numeric(10,2) NOT NULL DEFAULT '10000'`);
        await queryRunner.query(`ALTER TABLE "document_approval_configuration" ADD CONSTRAINT "FK_2bad47c03fa4e34856385ef3153" FOREIGN KEY ("updatedById") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_approval_configuration" DROP CONSTRAINT "FK_2bad47c03fa4e34856385ef3153"`);
        await queryRunner.query(`ALTER TABLE "general_settings" DROP COLUMN "low_amount_threshold"`);
        await queryRunner.query(`DROP TABLE "approval_flow_template"`);
        await queryRunner.query(`DROP TABLE "document_approval_configuration"`);
    }

}
