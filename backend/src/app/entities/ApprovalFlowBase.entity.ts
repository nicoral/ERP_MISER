import { Column } from 'typeorm';
import { Exclude } from 'class-transformer';

export abstract class ApprovalFlowBase {
  @Exclude()
  @Column({ nullable: true })
  firstSignature: string;

  @Column({ nullable: true })
  firstSignedBy: number;

  @Column({ nullable: true })
  firstSignedAt: Date;

  @Exclude()
  @Column({ nullable: true })
  secondSignature: string;

  @Column({ nullable: true })
  secondSignedBy: number;

  @Column({ nullable: true })
  secondSignedAt: Date;

  @Exclude()
  @Column({ nullable: true })
  thirdSignature: string;

  @Column({ nullable: true })
  thirdSignedBy: number;

  @Column({ nullable: true })
  thirdSignedAt: Date;

  @Exclude()
  @Column({ nullable: true })
  fourthSignature: string;

  @Column({ nullable: true })
  fourthSignedBy: number;

  @Column({ nullable: true })
  fourthSignedAt: Date;
}
