<!--
 Copyright 2021, 2022 Energy Web Foundation
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

# Tutorial

## Business overview
The business objective of this tutorial is to demonstrate how to request a Verifiable Credential (VC) presentation as a Verifiable Presentation from a user that is using a use-case application.
In the example below, we will request a permanent residency card from a user we will call "citizen". We therefore assume that the citizen is connected to the use-case app.

Business workflow:
- The citizen initiates some action on the use-case app which requires verification of a "PermanentResidentCard" credential
- The use-case app request a presentation invitation from the SSI server
- The use-case app displays a QR code for the citizen to scan with his mobile wallet to obtain details on which credentials are required
- The citizen's mobile wallet contacts the SSI server of the use-case app to obtain a presentation request
- The citizen's mobile wallet replies to the presentation request with a Verifiable Presentation
- The ssi server calls back to the use-case app to let it know the result of the presentation
- The use-case app accepts or denies the initial action initiated by the user

Note: the above flow could be accomplished by a user using a web wallet instead of a mobile wallet as well.
