import { Column } from 'typeorm';
import { Exclude } from 'class-transformer';

export abstract class ApprovalFlowBase {
  @Exclude()
  @Column('text', { nullable: true })
  firstSignature: string | null;

  @Column('int', { nullable: true })
  firstSignedBy: number | null;

  @Column('timestamp', { nullable: true })
  firstSignedAt: Date | null;

  @Exclude()
  @Column('text', { nullable: true })
  secondSignature: string | null;

  @Column('int', { nullable: true })
  secondSignedBy: number | null;

  @Column('timestamp', { nullable: true })
  secondSignedAt: Date | null;

  @Exclude()
  @Column('text', { nullable: true })
  thirdSignature: string | null;

  @Column('int', { nullable: true })
  thirdSignedBy: number | null;

  @Column('timestamp', { nullable: true })
  thirdSignedAt: Date | null;

  @Exclude()
  @Column('text', { nullable: true })
  fourthSignature: string | null;

  @Column('int', { nullable: true })
  fourthSignedBy: number | null;

  @Column('timestamp', { nullable: true })
  fourthSignedAt: Date | null;

  @Column('text', { nullable: true })
  rejectedReason: string | null;

  @Column('int', { nullable: true })
  rejectedBy: number | null;

  @Column('timestamp', { nullable: true })
  rejectedAt: Date | null;
}
