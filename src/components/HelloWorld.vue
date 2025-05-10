<template>
  <div class="lead-form">
    <h1>Lead Management Form</h1>

    <div v-if="submitSuccess" class="alert success">
      Form submitted successfully!
    </div>

    <div v-if="submitError" class="alert error">
      {{ submitError }}
    </div>

    <form @submit.prevent="submitForm">
      <div v-if="Object.keys(errors).length > 0" class="alert error">
        <div v-for="(error, field) in errors" 
             :key="field"
             class="error-message">
          {{ error }}
        </div>
      </div>

      <!-- Program Name -->
      <div class="form-group">
        <label for="programName">Program Name *</label>
        <select v-model="formData.programName" id="programName" required>
          <option value="MLOps specialization course">MLOps specialization course</option>
          <option value="GenAI Master class">GenAI Master class</option>
        </select>
      </div>

      <!-- Program Date -->
      <div class="form-group">
        <label for="programDate">Program Date *</label>
        <select v-model="formData.programDate" id="programDate" required>
          <option value="22nd Feb">22nd Feb</option>
          <option value="22nd March">22nd March</option>
        </select>
      </div>

      <!-- Name -->
      <div class="form-group">
        <label for="name">Name *</label>
        <input type="text" v-model="formData.name" id="name" required>
      </div>

      <!-- Phone Number -->
      <div class="form-group">
        <label for="phone">Phone Number *</label>
        <input type="tel" v-model="formData.phone" id="phone" required @input="generateWhatsAppLink">
      </div>

      <!-- WhatsApp Link -->
      <div class="form-group">
        <label for="whatsappLink">WhatsApp Link</label>
        <input type="text" v-model="formData.whatsappLink" id="whatsappLink" readonly>
      </div>

      <!-- Funnel Stage -->
      <div class="form-group">
        <label for="funnelStage">Funnel Stage *</label>
        <select v-model="formData.funnelStage" id="funnelStage" required>
          <option value="Lead">Lead</option>
          <option value="Initial contact">Initial contact</option>
          <option value="Warm">Warm</option>
          <option value="Negotiations">Negotiations</option>
          <option value="Cold">Cold</option>
          <option value="Won">Won</option>
          <option value="Lost">Lost</option>
        </select>
      </div>

      <!-- Send Message -->
      <div class="form-group">
        <label for="sendMessage">Send Message *</label>
        <select v-model="formData.sendMessage" id="sendMessage" required>
          <option value="Uncontacted">Uncontacted</option>
          <option value="Contacted">Contacted</option>
        </select>
      </div>

      <!-- Program Code -->
      <div class="form-group">
        <label for="programCode">Program Code *</label>
        <select v-model="formData.programCode" id="programCode" required>
          <option value="PSITRON01">PSITRON01</option>
          <option value="PSITRON02">PSITRON02</option>
        </select>
      </div>

      <!-- Lead Status -->
      <div class="form-group">
        <label for="leadStatus">Lead Status *</label>
        <select v-model="formData.leadStatus" id="leadStatus" required>
          <option value="Phone enquiry">Phone enquiry</option>
          <option value="WhatsApp enquiry">WhatsApp enquiry</option>
        </select>
      </div>

      <!-- Optional Fields -->
      <div class="form-group">
        <label for="email">Email ID</label>
        <input type="email" v-model="formData.email" id="email">
      </div>

      <div class="form-group">
        <label for="enquiry">Enquiry</label>
        <textarea v-model="formData.enquiry" id="enquiry"></textarea>
      </div>

      <div class="form-group">
        <label for="notes">Notes</label>
        <textarea v-model="formData.notes" id="notes"></textarea>
      </div>

      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Submitting...' : 'Submit' }}
      </button>
    </form>
  </div>
</template>

<script>
import { google } from 'googleapis';
import fs from 'fs';

export default {
  name: 'LeadForm',
  data() {
    return {
      formData: {
        programName: 'MLOps specialization course',
        programDate: '22nd Feb',
        name: '',
        phone: '',
        whatsappLink: '',
        funnelStage: 'Lead',
        sendMessage: 'Uncontacted',
        programCode: 'PSITRON01',
        leadStatus: 'Phone enquiry',
        inputDate: new Date().toISOString(),
        email: '',
        enquiry: '',
        notes: ''
      },
      errors: {},
      isSubmitting: false,
      submitSuccess: false,
      submitError: null
    };
  },
  methods: {
    generateWhatsAppLink() {
      if (this.formData.phone) {
        const formattedPhone = this.formatPhone(this.formData.phone);
        // Remove the '+' for WhatsApp link
        const cleanPhone = formattedPhone.replace(/^\+/, '');
        this.formData.whatsappLink = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=message`;
      }
    },
    async submitForm() {
      // Reset state
      this.submitSuccess = false;
      this.submitError = null;
      this.isSubmitting = true;

      // Validate form
      const { isValid, errors } = this.validateForm(this.formData);
      this.errors = errors;

      if (!isValid) {
        this.isSubmitting = false;
        return;
      }

      try {
        // Format phone number before submission
        this.formData.phone = this.formatPhone(this.formData.phone);
        
        await this.appendToGoogleSheet(this.formData);
        this.submitSuccess = true;
        this.resetForm();
      } catch (error) {
        console.error('Error submitting form:', error);
        this.submitError = error.message || 'Failed to submit form. Please try again.';
      } finally {
        this.isSubmitting = false;
      }
    },

    async appendToGoogleSheet(formData) {
      const serviceAccountFile = 'psitron-sheets.json';  // Update this path
      
      // Load the service account credentials
      const credentials = JSON.parse(fs.readFileSync(serviceAccountFile));

      // Authenticate using the service account
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });

      const service = google.sheets({ version: 'v4', auth });

      // Google Sheet ID
      const spreadsheetId = '1PKx1BBrTLlgkocGRvVpW8a2_ep7B0iwuDh2dfb_WCFs';  // Replace with your actual Google Sheet ID
      
      // Map form data to the required format
      const whatsappLink = formData.whatsappLink || '';
      const values = [
        [
          formData.programName,
          formData.programDate,
          formData.inputDate.split('T')[0], // Convert ISO date to YYYY-MM-DD
          '',
          formData.name,
          formData.email,
          '',
          '',
          formData.phone,
          formData.phone,
          '',
          formData.funnelStage,
          '',
          formData.sendMessage,
          '',
          formData.programCode,
          `=HYPERLINK("${whatsappLink}", "WhatsApp")`
        ]
      ];

      const resource = {
        values
      };

      // Specify the range for appending
      const range = 'psitrontechnologies!A1';  // This can be left without specifying the exact cell

      // Specify value input option
      const valueInputOption = 'USER_ENTERED';  // Use 'USER_ENTERED' to allow formulas to be interpreted

      try {
        // Append data to the sheet
        const response = await service.spreadsheets.values.append({
          spreadsheetId,
          range,
          valueInputOption,
          resource
        });
        
        console.log(`${response.data.updates.updatedCells} cells updated.`);
        return response;
      } catch (error) {
        console.error(`An error occurred: ${error}`);
        throw error;
      }
    },

    validateForm(formData) {
      const errors = {};
      if (!formData.name) errors.name = 'Name is required';
      if (!formData.phone) errors.phone = 'Phone number is required';
      // Add other validations as needed
      return { isValid: Object.keys(errors).length === 0, errors };
    },

    formatPhone(phone) {
      return phone.replace(/\D/g, '');  // Remove non-numeric characters
    },

    resetForm() {
      this.formData = {
        programName: 'MLOps specialization course',
        programDate: '22nd Feb',
        name: '',
        phone: '',
        whatsappLink: '',
        funnelStage: 'Lead',
        sendMessage: 'Uncontacted',
        programCode: 'PSITRON01',
        leadStatus: 'Phone enquiry',
        inputDate: new Date().toISOString(),
        email: '',
        enquiry: '',
        notes: ''
      };
      this.errors = {};
    }
  }
};
</script>

<style scoped>
/* Add your styles here */
</style>
