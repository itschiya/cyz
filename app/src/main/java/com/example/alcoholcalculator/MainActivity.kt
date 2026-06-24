package com.example.alcoholcalculator

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var etCurrentPercentage: EditText
    private lateinit var etCurrentVolume: EditText
    private lateinit var etDesiredPercentage: EditText
    private lateinit var btnCalculate: Button
    private lateinit var tvResult: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        etCurrentPercentage = findViewById(R.id.etCurrentPercentage)
        etCurrentVolume = findViewById(R.id.etCurrentVolume)
        etDesiredPercentage = findViewById(R.id.etDesiredPercentage)
        btnCalculate = findViewById(R.id.btnCalculate)
        tvResult = findViewById(R.id.tvResult)

        btnCalculate.setOnClickListener {
            calculateWater()
        }
    }

    private fun calculateWater() {
        val currentPercentageStr = etCurrentPercentage.text.toString()
        val currentVolumeStr = etCurrentVolume.text.toString()
        val desiredPercentageStr = etDesiredPercentage.text.toString()

        if (currentPercentageStr.isEmpty() || currentVolumeStr.isEmpty() || desiredPercentageStr.isEmpty()) {
            Toast.makeText(this, getString(R.string.error_empty_fields), Toast.LENGTH_SHORT).show()
            return
        }

        val currentPercentage = currentPercentageStr.toDoubleOrNull() ?: 0.0
        val currentVolume = currentVolumeStr.toDoubleOrNull() ?: 0.0
        val desiredPercentage = desiredPercentageStr.toDoubleOrNull() ?: 0.0

        if (desiredPercentage >= currentPercentage) {
            Toast.makeText(this, getString(R.string.error_invalid_desired_percentage), Toast.LENGTH_SHORT).show()
            return
        }

        if (desiredPercentage > 0) {
            // Formula: Required Water = ((currentPercentage * currentVolume) / desiredPercentage) - currentVolume
            val requiredWater = ((currentPercentage * currentVolume) / desiredPercentage) - currentVolume

            val formattedResult = String.format("%.2f", requiredWater)
            tvResult.text = getString(R.string.result_text, formattedResult)
        }
    }
}
