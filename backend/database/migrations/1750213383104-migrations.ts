import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1750213383104 implements MigrationInterface {
    name = 'Migrations1750213383104'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requirement_article" ADD "currency" character varying(5) NOT NULL DEFAULT 'PEN'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requirement_article" DROP COLUMN "currency"`);
    }

}
