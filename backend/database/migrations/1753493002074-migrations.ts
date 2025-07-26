import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1753493002074 implements MigrationInterface {
    name = 'Migrations1753493002074'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fuel_output" DROP COLUMN "vehicle_plate"`);
        await queryRunner.query(`ALTER TABLE "fuel_output" DROP COLUMN "equipment_code"`);
        await queryRunner.query(`ALTER TABLE "fuel_output" DROP COLUMN "destination"`);
        await queryRunner.query(`ALTER TABLE "fuel_output" DROP COLUMN "observations"`);
        await queryRunner.query(`ALTER TABLE "fuel_output" ADD "hour_meter" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fuel_output" ADD "cost_center_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fuel_output" DROP COLUMN "output_time"`);
        await queryRunner.query(`ALTER TABLE "fuel_output" ADD "output_time" TIME NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fuel_output" ADD CONSTRAINT "FK_d1e9b2092883e03560540853ad0" FOREIGN KEY ("cost_center_id") REFERENCES "cost_center"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fuel_output" DROP CONSTRAINT "FK_d1e9b2092883e03560540853ad0"`);
        await queryRunner.query(`ALTER TABLE "fuel_output" DROP COLUMN "output_time"`);
        await queryRunner.query(`ALTER TABLE "fuel_output" ADD "output_time" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fuel_output" DROP COLUMN "cost_center_id"`);
        await queryRunner.query(`ALTER TABLE "fuel_output" DROP COLUMN "hour_meter"`);
        await queryRunner.query(`ALTER TABLE "fuel_output" ADD "observations" text`);
        await queryRunner.query(`ALTER TABLE "fuel_output" ADD "destination" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "fuel_output" ADD "equipment_code" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "fuel_output" ADD "vehicle_plate" character varying(100)`);
    }

}
