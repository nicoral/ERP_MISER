import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1752539571949 implements MigrationInterface {
    name = 'Migrations1752539571949'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."exit_part_status_enum" AS ENUM('PENDING', 'COMPLETED')`);
        await queryRunner.query(`CREATE TABLE "exit_part" ("id" SERIAL NOT NULL, "code" character varying(50) NOT NULL, "status" "public"."exit_part_status_enum" NOT NULL DEFAULT 'COMPLETED', "imageUrl" character varying(255), "observation" text, "exitDate" date NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "purchase_order_id" integer, "warehouse_id" integer NOT NULL, "employee_id" integer, CONSTRAINT "UQ_84525ca417e154c0ac75dd0f06a" UNIQUE ("code"), CONSTRAINT "PK_ae0e44e78e450b53b3c5e691146" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."exit_part_article_inspection_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "exit_part_article" ("id" SERIAL NOT NULL, "code" character varying(100) NOT NULL, "name" character varying(255) NOT NULL, "unit" character varying(10) NOT NULL, "quantity" numeric(10,2) NOT NULL, "delivered" numeric(10,2) NOT NULL, "conform" boolean NOT NULL DEFAULT true, "qualityCert" boolean NOT NULL DEFAULT true, "guide" boolean NOT NULL DEFAULT true, "valued" integer NOT NULL DEFAULT '0', "inspection" "public"."exit_part_article_inspection_enum" NOT NULL DEFAULT 'PENDING', "observation" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "exit_part_id" integer, "article_id" integer, CONSTRAINT "PK_a1a5f61ff53684eb7ab0bac14d0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "exit_part" ADD CONSTRAINT "FK_545c945c07aa429cee99d0d13b5" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_order"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "exit_part" ADD CONSTRAINT "FK_1d8e05d3de780924ceee7c8917b" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "exit_part" ADD CONSTRAINT "FK_3ea7eea1de922fabd884c8ab4e7" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "exit_part_article" ADD CONSTRAINT "FK_6ad429726b55c8dd85e7c9e5328" FOREIGN KEY ("exit_part_id") REFERENCES "exit_part"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "exit_part_article" ADD CONSTRAINT "FK_5e5a96872de4419a20a764d50dd" FOREIGN KEY ("article_id") REFERENCES "article"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exit_part_article" DROP CONSTRAINT "FK_5e5a96872de4419a20a764d50dd"`);
        await queryRunner.query(`ALTER TABLE "exit_part_article" DROP CONSTRAINT "FK_6ad429726b55c8dd85e7c9e5328"`);
        await queryRunner.query(`ALTER TABLE "exit_part" DROP CONSTRAINT "FK_3ea7eea1de922fabd884c8ab4e7"`);
        await queryRunner.query(`ALTER TABLE "exit_part" DROP CONSTRAINT "FK_1d8e05d3de780924ceee7c8917b"`);
        await queryRunner.query(`ALTER TABLE "exit_part" DROP CONSTRAINT "FK_545c945c07aa429cee99d0d13b5"`);
        await queryRunner.query(`DROP TABLE "exit_part_article"`);
        await queryRunner.query(`DROP TYPE "public"."exit_part_article_inspection_enum"`);
        await queryRunner.query(`DROP TABLE "exit_part"`);
        await queryRunner.query(`DROP TYPE "public"."exit_part_status_enum"`);
    }

}
