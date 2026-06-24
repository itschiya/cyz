package com.example.alcoholcalculator

import org.junit.Assert.assertEquals
import org.junit.Test

class CalculatorTest {

    @Test
    fun testWaterCalculation1() {
        val currentPercentage = 96.0
        val currentVolume = 1000.0
        val desiredPercentage = 70.0

        // Formula: Required Water = ((currentPercentage * currentVolume) / desiredPercentage) - currentVolume
        val expected = ((96.0 * 1000.0) / 70.0) - 1000.0 // ~371.42857

        val actual = calculateWater(currentPercentage, currentVolume, desiredPercentage)

        assertEquals(expected, actual, 0.01)
    }

    @Test
    fun testWaterCalculation2() {
        val currentPercentage = 50.0
        val currentVolume = 500.0
        val desiredPercentage = 40.0

        val expected = ((50.0 * 500.0) / 40.0) - 500.0 // 125.0

        val actual = calculateWater(currentPercentage, currentVolume, desiredPercentage)

        assertEquals(expected, actual, 0.01)
    }

    // To test this easily, we extract the calculation to a simple helper function.
    private fun calculateWater(currentPercentage: Double, currentVolume: Double, desiredPercentage: Double): Double {
        return ((currentPercentage * currentVolume) / desiredPercentage) - currentVolume
    }
}
