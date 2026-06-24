package com.example.alcoholcalculator

import android.os.Bundle
import android.view.View
import android.widget.ArrayAdapter
import android.widget.AutoCompleteTextView
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.card.MaterialCardView
import com.google.android.material.textfield.TextInputEditText
import java.util.Locale

class MainActivity : AppCompatActivity() {

    private lateinit var etCurrentPercentage: TextInputEditText
    private lateinit var etCurrentVolume: TextInputEditText
    private lateinit var actvUnit: AutoCompleteTextView
    private lateinit var etDesiredPercentage: TextInputEditText
    private lateinit var btnCalculate: Button
    private lateinit var resultCard: MaterialCardView
    private lateinit var tvResult: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        etCurrentPercentage = findViewById(R.id.etCurrentPercentage)
        etCurrentVolume = findViewById(R.id.etCurrentVolume)
        actvUnit = findViewById(R.id.actvUnit)
        etDesiredPercentage = findViewById(R.id.etDesiredPercentage)
        btnCalculate = findViewById(R.id.btnCalculate)
        resultCard = findViewById(R.id.resultCard)
        tvResult = findViewById(R.id.tvResult)

        val units = resources.getStringArray(R.array.volume_units)
        val adapter = ArrayAdapter(this, android.R.layout.simple_dropdown_item_1line, units)
        actvUnit.setAdapter(adapter)

        // Set default selection
        if (units.isNotEmpty()) {
            actvUnit.setText(units[0], false)
        }

        btnCalculate.setOnClickListener {
            calculateWater()
        }
    }

    private fun calculateWater() {
        val currentPercentageStr = etCurrentPercentage.text.toString()
        val currentVolumeStr = etCurrentVolume.text.toString()
        val desiredPercentageStr = etDesiredPercentage.text.toString()
        val unitStr = actvUnit.text.toString()

        if (currentPercentageStr.isEmpty() || currentVolumeStr.isEmpty() || desiredPercentageStr.isEmpty() || unitStr.isEmpty()) {
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

            val faLocale = Locale("fa", "IR")
            val formattedResult = String.format(faLocale, "%.2f", requiredWater)

            // Extract just the short unit string if it exists in parenthesis, e.g. (ml) -> ml
            val shortUnit = unitStr.substringAfter("(", unitStr).substringBefore(")", unitStr)

            tvResult.text = getString(R.string.result_text, formattedResult, shortUnit)
            resultCard.visibility = View.VISIBLE
        } else {
            resultCard.visibility = View.GONE
        }
    }
}
