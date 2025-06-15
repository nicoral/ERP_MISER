import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1749786427731 implements MigrationInterface {
    name = 'Migrations1749786427731'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "brand" ALTER COLUMN "imageUrl" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "brand" ALTER COLUMN "imageUrl" SET NOT NULL`);
    }

}
