import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1753556969275 implements MigrationInterface {
    name = 'Migrations1753556969275'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fuel_output" ADD "image_url" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fuel_output" DROP COLUMN "image_url"`);
    }

}
