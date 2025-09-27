#include <iostream>
#include <math.h>

/*
			For approximating the value of Pi using Monte Carlo Estimation.
*/

const double pi = 3.14159265358979323;

const double RAND_MAX_reciprocal = (double)1.0 / (double)RAND_MAX;

// return value inclusively between 0 and 1
double GetRandomValue () {
	return (double)std::rand() * RAND_MAX_reciprocal;
}

// get new (x, y) point, return pointer
double * CreatePoint () {
	double *point = new double[ 2 ];
	point[ 0 ] = GetRandomValue();
	point[ 1 ] = GetRandomValue();
	return point;
}

// Check the square distance between a point and the origin,
// returning true if the square distance is within 1 unit.
bool CheckSquareDistanceToOrigin ( double *point ) {
	return ( ( point[0] * point[0] ) + ( point[1] * point[1] ) ) <= 1;
}

// Create a point and check if it's within 1 unit of the origin,
// updating counters accordingly
void TestRandomPoint ( unsigned int & counter_pointsInsideCircle, unsigned int & counter_totalPoints ) {

	// get new (x,y) pair
	double *point = CreatePoint();

	bool squareDistanceCheck = CheckSquareDistanceToOrigin( point );

	// deallocate memory
	delete[] point;

	if( squareDistanceCheck ) {
		counter_pointsInsideCircle += 1;
	}
	
	counter_totalPoints += 1;
}

void estimatePi ( unsigned int numberOfPoints ) {

	std::cout << "Calculating Estimate for Pi using " << numberOfPoints << " points:\n";

	unsigned int counter_pointsInsideCircle = 0, counter_totalPoints = 0;

	for( unsigned int i = 0; i < numberOfPoints; i++ ) {
		TestRandomPoint(  counter_pointsInsideCircle, counter_totalPoints );
	}

	double estimateOfPi = (double)4 * counter_pointsInsideCircle / counter_totalPoints;
	double absoluteError = fabs(pi - estimateOfPi);
	double percentageError = ( absoluteError / pi ) * 100;

	std::cout << "  Estimate: " << estimateOfPi << "\n";
	std::cout << "  Absolute Error: " << absoluteError << "\n";
	std::cout << "  Percentage Error: " << percentageError << "\n\n";
}

int main() {
	std::cout.precision(10);

	//Etimate Pi using increasingly larger number of points
	for( unsigned int i = 1; i <= 500; i++ ) {
		estimatePi( i * 100 );
	}

	return 0;
}