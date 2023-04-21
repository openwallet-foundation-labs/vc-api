A short guide for exchange-definitions examples

The flows in the different use cases (presentation exchange) can be categorized into three types, which are:

1. _Presentation_ - It can be referred to as a presentation / exchange of credentials issued by an authority. For example, `PermanentResidentCard`.
* The interact type would be `Unmediated`.
* The `presentation-definition` in the `credentialQuery` should ask for `PermanentResidentCard` (refer to [presentation-exchange](./presentation-exchange.md) example).

2. _Self-sign_ - It can be referred to as a presentation / exchange of a self-signed credential. For example, `ConsentCredential`. The exchange type in this case would be `Unmediated`.
* The interact type would be `Unmediated`.
* The `presentation-definition` in the `credentialQuery` should ask for a self-signed `ConsentCredential` (refer to [self-sign-exchange](./self-signed-exchange.md) example).

3. _Issuance_ - It can be referred to as a presentation / exchange needed to issue another credential.
* The interact type would be of type `Mediated`.
* An Issuance always comes after a presentation.
* The presentation needed for issuance can be of type `DIDAuth` or `PresentationDefinition`.
* The `DIDAuth` type exchange is required to prove control over the `DID` to which the credential is being issued (refer to [issuance-exchange](./issuance-exchange.md) example).
* For the exchange of type `PresentationDefinition`, the `credentialQuery` should ask for a credential. In our case, it could be either a self-signed credential i.e., `ConsentCredential` or `PermanentResidentCard`. The issuer gets the `DID` of the subject from the Verifiable Presentation containing the credential (refer to [presentation-issuance-exchange](./presentation-issuance-exchange.md) example).

Refer to the below specifications for a better understanding:

* [Presentation Definition](https://identity.foundation/presentation-exchange/#presentation-definition)
* [Submission Requirements](https://identity.foundation/presentation-exchange/#submission-requirement-feature)