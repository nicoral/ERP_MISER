import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1751734543170 implements MigrationInterface {
    name = 'Migrations1751734543170'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."requirement_service_durationtype_enum" AS ENUM('HORA', 'CONTRATO', 'DIA', 'JORNADA')`);
        await queryRunner.query(`CREATE TABLE "requirement_service" ("id" SERIAL NOT NULL, "unit_price" numeric(10,2) NOT NULL, "justification" text, "currency" character varying(5) NOT NULL DEFAULT 'PEN', "durationType" "public"."requirement_service_durationtype_enum", "duration" integer, "requirementId" integer, "serviceId" integer, CONSTRAINT "PK_5652d1ac277e4fe8fd1121d39ee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."requirement_type_enum" AS ENUM('ARTICLE', 'SERVICE')`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD "type" "public"."requirement_type_enum" NOT NULL DEFAULT 'ARTICLE'`);
        await queryRunner.query(`ALTER TABLE "requirement_service" ADD CONSTRAINT "FK_8fbc77e56125f2c7f430e7a4e93" FOREIGN KEY ("requirementId") REFERENCES "requirement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requirement_service" ADD CONSTRAINT "FK_1e4b01fa0f9afd4c9368e14b126" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requirement_service" DROP CONSTRAINT "FK_1e4b01fa0f9afd4c9368e14b126"`);
        await queryRunner.query(`ALTER TABLE "requirement_service" DROP CONSTRAINT "FK_8fbc77e56125f2c7f430e7a4e93"`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."requirement_type_enum"`);
        await queryRunner.query(`DROP TABLE "requirement_service"`);
        await queryRunner.query(`DROP TYPE "public"."requirement_service_durationtype_enum"`);
    }

}
