import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1753842604137 implements MigrationInterface {
    name = 'Migrations1753842604137'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."exit_part_service_inspection_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'OBSERVED')`);
        await queryRunner.query(`CREATE TABLE "exit_part_service" ("id" SERIAL NOT NULL, "code" character varying(100) NOT NULL, "name" character varying(255) NOT NULL, "duration" integer NOT NULL, "durationType" character varying(20) NOT NULL, "received" numeric(10,2) NOT NULL, "inspection" "public"."exit_part_service_inspection_enum" NOT NULL DEFAULT 'PENDING', "observation" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "exit_part_id" integer, "service_id" integer, CONSTRAINT "PK_95007c56bfa494d669017b04fdf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."entry_part_type_enum" AS ENUM('ARTICLE', 'SERVICE')`);
        await queryRunner.query(`ALTER TABLE "entry_part" ADD "type" "public"."entry_part_type_enum" NOT NULL DEFAULT 'ARTICLE'`);
        await queryRunner.query(`ALTER TABLE "exit_part_service" ADD CONSTRAINT "FK_8f41c0b36e3d69d5c38098826ad" FOREIGN KEY ("exit_part_id") REFERENCES "exit_part"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "exit_part_service" ADD CONSTRAINT "FK_117e8e2fa6566899448416a1c64" FOREIGN KEY ("service_id") REFERENCES "service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exit_part_service" DROP CONSTRAINT "FK_117e8e2fa6566899448416a1c64"`);
        await queryRunner.query(`ALTER TABLE "exit_part_service" DROP CONSTRAINT "FK_8f41c0b36e3d69d5c38098826ad"`);
        await queryRunner.query(`ALTER TABLE "entry_part" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."entry_part_type_enum"`);
        await queryRunner.query(`DROP TABLE "exit_part_service"`);
        await queryRunner.query(`DROP TYPE "public"."exit_part_service_inspection_enum"`);
    }

}
