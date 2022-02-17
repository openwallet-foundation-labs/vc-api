import { IsString } from 'class-validator';
import { AckStatus } from '../types/ack-status';

/**
 * Intended to align with the Present-Proof Ack Presentation object
 *
 * https://github.com/hyperledger/aries-rfcs/tree/main/features/0454-present-proof-v2#ack-presentation
 */
export class AckPresentationDto {
  /**
   * https://github.com/hyperledger/aries-rfcs/blob/main/features/0015-acks/README.md#ack-status
   *
   * The status field in an ack tells whether the ack is final or not with respect to the message being acknowledged.
   *
   * It has 3 predefined values:
   * - OK (which means an outcome has occurred, and it was positive);
   * - FAIL (an outcome has occurred, and it was negative);
   * - PENDING, which acknowledges that no outcome is yet known.
   *
   * In addition, more advanced usage is possible.
   */
  @IsString()
  status: AckStatus;
}
