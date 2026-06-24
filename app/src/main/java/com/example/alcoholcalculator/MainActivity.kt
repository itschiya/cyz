package com.example.alcoholcalculator

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.button.MaterialButtonToggleGroup
import com.google.android.material.card.MaterialCardView
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import java.util.Locale

class MainActivity : AppCompatActivity() {

    private lateinit var etCurrentPercentage: TextInputEditText
    private lateinit var etCurrentVolume: TextInputEditText
    private lateinit var tilCurrentVolume: TextInputLayout
    private lateinit var etDesiredPercentage: TextInputEditText
    private lateinit var btnCalculate: Button
    private lateinit var btnReset: Button
    private lateinit var resultCard: MaterialCardView
    private lateinit var tvWaterToAdd: TextView
    private lateinit var tvWaterToAddUnit: TextView
    private lateinit var tvEquivalentTo: TextView
    private lateinit var tvFinalVolume: TextView
    private lateinit var tvVerifiedAbv: TextView
    private lateinit var tvDilutionRatio: TextView
    private lateinit var toggleGroupUnit: MaterialButtonToggleGroup

    enum class UnitType(val factor: Double, val symbol: String) {
        ML(1.0, "ml"),
        L(1000.0, "L"),
        OZ(29.5735, "oz"),
        GAL(3785.41, "gal")
    }

    private var currentUnit = UnitType.ML

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        etCurrentPercentage = findViewById(R.id.etCurrentPercentage)
        etCurrentVolume = findViewById(R.id.etCurrentVolume)
        tilCurrentVolume = findViewById(R.id.tilCurrentVolume)
        etDesiredPercentage = findViewById(R.id.etDesiredPercentage)
        btnCalculate = findViewById(R.id.btnCalculate)
        btnReset = findViewById(R.id.btnReset)
        resultCard = findViewById(R.id.resultCard)
        tvWaterToAdd = findViewById(R.id.tvWaterToAdd)
        tvWaterToAddUnit = findViewById(R.id.tvWaterToAddUnit)
        tvEquivalentTo = findViewById(R.id.tvEquivalentTo)
        tvFinalVolume = findViewById(R.id.tvFinalVolume)
        tvVerifiedAbv = findViewById(R.id.tvVerifiedAbv)
        tvDilutionRatio = findViewById(R.id.tvDilutionRatio)
        toggleGroupUnit = findViewById(R.id.toggleGroupUnit)

        toggleGroupUnit.addOnButtonCheckedListener { _, checkedId, isChecked ->
            if (isChecked) {
                currentUnit = when (checkedId) {
                    R.id.btnMl -> UnitType.ML
                    R.id.btnL -> UnitType.L
                    R.id.btnOz -> UnitType.OZ
                    R.id.btnGal -> UnitType.GAL
                    else -> UnitType.ML
                }
                tilCurrentVolume.suffixText = currentUnit.symbol
                // Recalculate if result is already visible
                if (resultCard.visibility == View.VISIBLE) {
                    calculateWater()
                }
            }
        }

        btnCalculate.setOnClickListener {
            calculateWater()
        }

        btnReset.setOnClickListener {
            reset()
        }
    }

    private fun reset() {
        etCurrentPercentage.text?.clear()
        etCurrentVolume.text?.clear()
        etDesiredPercentage.text?.clear()
        resultCard.visibility = View.GONE
        btnReset.visibility = View.GONE
    }

    private fun toMl(value: Double, unit: UnitType): Double {
        return value * unit.factor
    }

    private fun fromMl(value: Double, unit: UnitType): Double {
        return value / unit.factor
    }

    private fun formatNum(n: Double, unit: UnitType): String {
        val converted = fromMl(n, unit)
        val locale = Locale("fa", "IR")
        return when {
            converted >= 1000 -> String.format(locale, "%.1f", converted)
            converted >= 10 -> String.format(locale, "%.2f", converted)
            else -> String.format(locale, "%.3f", converted)
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

        val c = currentPercentageStr.toDoubleOrNull()
        val v = currentVolumeStr.toDoubleOrNull()
        val d = desiredPercentageStr.toDoubleOrNull()

        if (c == null || v == null || d == null) {
            Toast.makeText(this, getString(R.string.error_empty_fields), Toast.LENGTH_SHORT).show()
            return
        }

        if (c <= 0 || c > 100 || d <= 0 || d > 100) {
            Toast.makeText(this, getString(R.string.error_invalid_abv), Toast.LENGTH_SHORT).show()
            return
        }

        if (d >= c) {
            Toast.makeText(this, getString(R.string.error_invalid_desired_percentage), Toast.LENGTH_SHORT).show()
            return
        }

        if (v <= 0) {
            Toast.makeText(this, getString(R.string.error_invalid_volume), Toast.LENGTH_SHORT).show()
            return
        }

        val locale = Locale("fa", "IR")

        val volumeMl = toMl(v, currentUnit)
        val waterMl = (c * volumeMl) / d - volumeMl

        tvWaterToAdd.text = formatNum(waterMl, currentUnit)
        tvWaterToAddUnit.text = currentUnit.symbol

        val equivalentText = if (waterMl < 1000) {
            String.format(locale, "%.1f ml", waterMl)
        } else {
            String.format(locale, "%.3f L", waterMl / 1000.0)
        }
        tvEquivalentTo.text = getString(R.string.also_equivalent_to, equivalentText)

        val totalVolumeMl = volumeMl + waterMl
        tvFinalVolume.text = String.format(locale, "%s %s", formatNum(totalVolumeMl, currentUnit), currentUnit.symbol)

        val finalAbvCheck = (c * v) / (v + fromMl(waterMl, currentUnit))
        tvVerifiedAbv.text = String.format(locale, "%.1f %%", finalAbvCheck)

        val dilutionRatio = waterMl / volumeMl
        tvDilutionRatio.text = String.format(locale, "۱ : %.2f", dilutionRatio)

        resultCard.visibility = View.VISIBLE
        btnReset.visibility = View.VISIBLE

        // Scroll down
        resultCard.post {
            val scrollView = findViewById<androidx.core.widget.NestedScrollView>(R.id.resultCard)
            scrollView?.smoothScrollTo(0, resultCard.bottom)
        }
    }
}
