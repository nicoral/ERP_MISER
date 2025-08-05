import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1753914134997 implements MigrationInterface {
    name = 'Migrations1753914134997'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."exit_part_type_enum" AS ENUM('ARTICLE', 'SERVICE')`);
        await queryRunner.query(`ALTER TABLE "exit_part" ADD "type" "public"."exit_part_type_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exit_part" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."exit_part_type_enum"`);
    }

}
