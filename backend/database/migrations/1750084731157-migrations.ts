import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1750084731157 implements MigrationInterface {
    name = 'Migrations1750084731157'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cost_center" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_814d737123e3a42d0a37e97b393" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "cost_center"`);
    }

}
