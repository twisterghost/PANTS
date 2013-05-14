all:
	node pants --threads 1
	node pants --threads 2
	node pants --threads 3
	node pants --threads 4
	node pants --train data/lungCancer_train.data --test data/lungCancer_test.data --threads 1
	node pants --train data/lungCancer_train.data --test data/lungCancer_test.data --threads 2
	node pants --train data/lungCancer_train.data --test data/lungCancer_test.data --threads 3
	node pants --train data/lungCancer_train.data --test data/lungCancer_test.data --threads 4
	node pants --train data/breastCancer-train.data --test data/breastCancer-test.data --threads 1
	node pants --train data/breastCancer-train.data --test data/breastCancer-test.data --threads 2
	node pants --train data/breastCancer-train.data --test data/breastCancer-test.data --threads 3
	node pants --train data/breastCancer-train.data --test data/breastCancer-test.data --threads 4
	node pants --train data/ALL-AML_train.data --test data/ALL-AML_test.data --threads 1
	node pants --train data/ALL-AML_train.data --test data/ALL-AML_test.data --threads 2
	node pants --train data/ALL-AML_train.data --test data/ALL-AML_test.data --threads 3
	node pants --train data/ALL-AML_train.data --test data/ALL-AML_test.data --threads 4
