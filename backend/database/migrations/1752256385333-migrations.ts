import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1752256385333 implements MigrationInterface {
    name = 'Migrations1752256385333'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."entry_part_status_enum" AS ENUM('PENDING', 'COMPLETED')`);
        await queryRunner.query(`CREATE TABLE "entry_part" ("id" SERIAL NOT NULL, "code" character varying(50) NOT NULL, "status" "public"."entry_part_status_enum" NOT NULL DEFAULT 'COMPLETED', "imageUrl" character varying(255), "observation" text, "entryDate" date NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "purchase_order_id" integer, "employee_id" integer NOT NULL, CONSTRAINT "UQ_dbfc7ea0ac67fb2021343f9b32c" UNIQUE ("code"), CONSTRAINT "PK_9af08b755758feb2977b03b176d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."entry_part_article_inspection_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "entry_part_article" ("id" SERIAL NOT NULL, "code" character varying(100) NOT NULL, "name" character varying(255) NOT NULL, "unit" character varying(10) NOT NULL, "quantity" numeric(10,2) NOT NULL, "received" numeric(10,2) NOT NULL, "conform" boolean NOT NULL DEFAULT true, "qualityCert" boolean NOT NULL DEFAULT true, "guide" boolean NOT NULL DEFAULT true, "inspection" "public"."entry_part_article_inspection_enum" NOT NULL DEFAULT 'PENDING', "observation" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "entry_part_id" integer, "article_id" integer, CONSTRAINT "PK_bd9e36f17e9e107a85ece5a9ccc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "entry_part" ADD CONSTRAINT "FK_48fbad2e5791a3a0194eeb5cbf7" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "entry_part" ADD CONSTRAINT "FK_7b074678e1df2479096d10efa13" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "entry_part_article" ADD CONSTRAINT "FK_ed0048259bf2b031675bf7c2b0c" FOREIGN KEY ("entry_part_id") REFERENCES "entry_part"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "entry_part_article" ADD CONSTRAINT "FK_f6243a6c6b09ec184a9471091cb" FOREIGN KEY ("article_id") REFERENCES "article"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "entry_part_article" DROP CONSTRAINT "FK_f6243a6c6b09ec184a9471091cb"`);
        await queryRunner.query(`ALTER TABLE "entry_part_article" DROP CONSTRAINT "FK_ed0048259bf2b031675bf7c2b0c"`);
        await queryRunner.query(`ALTER TABLE "entry_part" DROP CONSTRAINT "FK_7b074678e1df2479096d10efa13"`);
        await queryRunner.query(`ALTER TABLE "entry_part" DROP CONSTRAINT "FK_48fbad2e5791a3a0194eeb5cbf7"`);
        await queryRunner.query(`DROP TABLE "entry_part_article"`);
        await queryRunner.query(`DROP TYPE "public"."entry_part_article_inspection_enum"`);
        await queryRunner.query(`DROP TABLE "entry_part"`);
        await queryRunner.query(`DROP TYPE "public"."entry_part_status_enum"`);
    }

}
