import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1749525416964 implements MigrationInterface {
    name = 'Migrations1749525416964'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "warehouse" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "address" character varying(255) NOT NULL, "hire_date" date, "dismissal_date" date, "active" boolean NOT NULL, "valued" numeric NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "employeeId" integer, CONSTRAINT "PK_965abf9f99ae8c5983ae74ebde8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "warehouse" ADD CONSTRAINT "FK_9f7893d2776ef7013113cd94073" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "warehouse" DROP CONSTRAINT "FK_9f7893d2776ef7013113cd94073"`);
        await queryRunner.query(`DROP TABLE "warehouse"`);
    }

}
