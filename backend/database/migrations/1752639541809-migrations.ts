import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1752639541809 implements MigrationInterface {
    name = 'Migrations1752639541809'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."entry_part_service_inspection_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'OBSERVED')`);
        await queryRunner.query(`CREATE TABLE "entry_part_service" ("id" SERIAL NOT NULL, "code" character varying(100) NOT NULL, "name" character varying(255) NOT NULL, "duration" integer NOT NULL, "durationType" character varying(20) NOT NULL, "received" numeric(10,2) NOT NULL, "conform" boolean NOT NULL DEFAULT true, "qualityCert" boolean NOT NULL DEFAULT true, "guide" boolean NOT NULL DEFAULT true, "valued" integer NOT NULL DEFAULT '0', "inspection" "public"."entry_part_service_inspection_enum" NOT NULL DEFAULT 'PENDING', "observation" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "entry_part_id" integer, "service_id" integer, CONSTRAINT "PK_93eb60d627f8c7dab2d817717c1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."entry_part_article_inspection_enum" RENAME TO "entry_part_article_inspection_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."entry_part_article_inspection_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'OBSERVED')`);
        await queryRunner.query(`ALTER TABLE "entry_part_article" ALTER COLUMN "inspection" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "entry_part_article" ALTER COLUMN "inspection" TYPE "public"."entry_part_article_inspection_enum" USING "inspection"::"text"::"public"."entry_part_article_inspection_enum"`);
        await queryRunner.query(`ALTER TABLE "entry_part_article" ALTER COLUMN "inspection" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."entry_part_article_inspection_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."exit_part_article_inspection_enum" RENAME TO "exit_part_article_inspection_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."exit_part_article_inspection_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'OBSERVED')`);
        await queryRunner.query(`ALTER TABLE "exit_part_article" ALTER COLUMN "inspection" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "exit_part_article" ALTER COLUMN "inspection" TYPE "public"."exit_part_article_inspection_enum" USING "inspection"::"text"::"public"."exit_part_article_inspection_enum"`);
        await queryRunner.query(`ALTER TABLE "exit_part_article" ALTER COLUMN "inspection" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."exit_part_article_inspection_enum_old"`);
        await queryRunner.query(`ALTER TABLE "entry_part_service" ADD CONSTRAINT "FK_5e12686a60a254ab525e039dca2" FOREIGN KEY ("entry_part_id") REFERENCES "entry_part"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "entry_part_service" ADD CONSTRAINT "FK_f33ffc3362474f24c4acb899b48" FOREIGN KEY ("service_id") REFERENCES "service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "entry_part_service" DROP CONSTRAINT "FK_f33ffc3362474f24c4acb899b48"`);
        await queryRunner.query(`ALTER TABLE "entry_part_service" DROP CONSTRAINT "FK_5e12686a60a254ab525e039dca2"`);
        await queryRunner.query(`CREATE TYPE "public"."exit_part_article_inspection_enum_old" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED')`);
        await queryRunner.query(`ALTER TABLE "exit_part_article" ALTER COLUMN "inspection" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "exit_part_article" ALTER COLUMN "inspection" TYPE "public"."exit_part_article_inspection_enum_old" USING "inspection"::"text"::"public"."exit_part_article_inspection_enum_old"`);
        await queryRunner.query(`ALTER TABLE "exit_part_article" ALTER COLUMN "inspection" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."exit_part_article_inspection_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."exit_part_article_inspection_enum_old" RENAME TO "exit_part_article_inspection_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."entry_part_article_inspection_enum_old" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED')`);
        await queryRunner.query(`ALTER TABLE "entry_part_article" ALTER COLUMN "inspection" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "entry_part_article" ALTER COLUMN "inspection" TYPE "public"."entry_part_article_inspection_enum_old" USING "inspection"::"text"::"public"."entry_part_article_inspection_enum_old"`);
        await queryRunner.query(`ALTER TABLE "entry_part_article" ALTER COLUMN "inspection" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."entry_part_article_inspection_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."entry_part_article_inspection_enum_old" RENAME TO "entry_part_article_inspection_enum"`);
        await queryRunner.query(`DROP TABLE "entry_part_service"`);
        await queryRunner.query(`DROP TYPE "public"."entry_part_service_inspection_enum"`);
    }

}
