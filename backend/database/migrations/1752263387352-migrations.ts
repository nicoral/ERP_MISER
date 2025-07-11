import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1752263387352 implements MigrationInterface {
    name = 'Migrations1752263387352'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "entry_part" ADD "warehouse_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "entry_part" DROP CONSTRAINT "FK_7b074678e1df2479096d10efa13"`);
        await queryRunner.query(`ALTER TABLE "entry_part" ALTER COLUMN "employee_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "entry_part" ADD CONSTRAINT "FK_056c59f6ce8831d939bc6db1fd7" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "entry_part" ADD CONSTRAINT "FK_7b074678e1df2479096d10efa13" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "entry_part" DROP CONSTRAINT "FK_7b074678e1df2479096d10efa13"`);
        await queryRunner.query(`ALTER TABLE "entry_part" DROP CONSTRAINT "FK_056c59f6ce8831d939bc6db1fd7"`);
        await queryRunner.query(`ALTER TABLE "entry_part" ALTER COLUMN "employee_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "entry_part" ADD CONSTRAINT "FK_7b074678e1df2479096d10efa13" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "entry_part" DROP COLUMN "warehouse_id"`);
    }

}
