# Fix Player Client confusion

Clients are identified by playerId which two clients may share.
In that case the provisions for the lock-out do not work and
textarea are not updated. Basic aynchronization should not be
affected though.
