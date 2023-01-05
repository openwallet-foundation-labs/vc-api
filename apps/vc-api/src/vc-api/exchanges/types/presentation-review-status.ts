/**
 * Copyright 2021 - 2023 Energy Web Foundation
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * The status of a presentation review
 * These statuses are NON-STANDARD
 *
 * Similar to {@link https://github.com/energywebfoundation/ssi-hub/blob/8b860e7cdae4e1b1aa75afeab8b9df7ab26befbb/src/modules/claim/claim.types.ts#L7}
 *
 * Maybe similar to Aries Issue-Credential protocol {@link https://github.com/hyperledger/aries-rfcs/blob/main/features/0453-issue-credential-v2/README.md}
 */
export enum PresentationReviewStatus {
  pendingSubmission = 'pending_submission',
  pendingReview = 'pending_review',
  approved = 'approved',
  rejected = 'rejected'
}
