# Off-the-record-Messaging
Secure Messaging Application (encrypted and secure) no record is stored 


Off-the-Record Messaging (OTR) is a cryptographic protocol that provides encryption for instant messaging conversations

Theory-
	1. Deffie Hellman Key exchange
	2. AES (maybe some other symmetric encryption scheme)
	
Properties-
	1. Forward secrecy, also known as perfect forward secrecy — for protecting past chat 		sessions against future compromises of secret keys or passwords (new key for each message sessions)
	
	2.Mutual authentication — for making sure that the person you're chatting with really is 			that person and vice versa(possible ways are question and answer or manual fingerprint verification, use a shared secret)
	(may use  socialist millionaire protocol)
	
	3. Deniable authentication: Messages in a conversation do not have digital signatures, and 		after a conversation is complete, anyone is able to forge a message to appear to have come 		from one of the participants in the conversation, assuring that it is impossible to prove 		that a specific message came from a specific person. Within the conversation the recipient 		can be sure that a message is coming from the person they have identified.


As of OTR 3.1, the protocol supports mutual authentication of users using a shared secret through the socialist millionaire protocol. This feature makes it possible for users to verify the identity of the remote party

in the Off-the-Record Messaging protocol, {\displaystyle p}p is a specific fixed 1,536-bit prime.

To provide:-
	Using a library
	proof of security (basic analysis)
	design a web app for chatting

Tech used:-
	(nodejs) + expressjs



