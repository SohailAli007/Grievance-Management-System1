import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

// Translation dictionary
const translations = {
    en: {
        // Navigation
        home: 'Home',
        fileComplaint: 'File Complaint',
        trackComplaints: 'Track Complaints',
        myProfile: 'My Profile',
        settings: 'Settings',
        language: 'Language',
        helpSupport: 'Help & Support',
        aboutUs: 'About Us',
        logout: 'Log Out',

        // Profile
        citizen: 'Citizen',
        totalComplaints: 'Total Complaints',
        resolvedItems: 'Resolved Items',
        personalInformation: 'Personal Information',
        permanentAccountDetails: 'Permanent account details',
        phoneNumber: 'Phone Number',
        currentAddress: 'Current Address',
        permanentAddress: 'Permanent Address',
        permanentInformation: 'Permanent Information',
        address: 'Address',
        notProvided: 'Not provided',
        noAddressAdded: 'No address added yet',
        changeDetail: 'Change Detail',
        note: 'Note',
        criticalDetailsNote: 'Critical details are maintained as permanent records.',

        // Settings
        changeDetails: 'Change Details',
        accountSettings: 'Account Settings',
        firstName: 'First Name',
        lastName: 'Last Name',
        secondaryPhone: 'Secondary Phone',
        emailAddress: 'Email Address',
        secondaryEmail: 'Secondary Email',
        optional: 'Optional',
        saveChanges: 'Save Changes',
        changeRestriction: 'Can only be changed once every 45 days',
        notifications: 'Notifications',
        privacySecurity: 'Privacy & Security',
        changePasswordLink: 'Change Password →',

        // File Complaint
        fileANewComplaint: 'File a New Complaint',
        reportIssueToAuthorities: 'Quickly report an issue to your local authorities',
        department: 'Department',
        issueCategory: 'Issue Category',
        selectDepartment: 'Select Department',
        selectIssue: 'Select Issue',
        locationAddress: 'Location / Address',
        whereDidThisHappen: 'Where did this happen?',
        detailsOptional: 'Details (Optional)',
        additionalContext: 'Provide any additional context...',
        evidencePhoto: 'Evidence Photo',
        uploadImage: 'Upload Image',
        submitComplaint: 'Submit Final Complaint',
        complaintSuccessNote: 'Your complaint will be reviewed by relevant authorities within 24 hours.',

        // Track Complaints
        viewStatusOfGrievances: 'View the status of your submitted grievances.',
        refresh: 'Refresh',
        complaintId: 'Complaint ID',
        issueTitle: 'Issue Title',
        status: 'Status',
        assignedOfficer: 'Assigned Officer',
        updateDate: 'Update Date',
        noComplaintsFound: 'No complaints found.',
        awaitingAllocation: 'Awaiting Allocation',
        location: 'Location / Address',
        descriptionDetails: 'Description / Details',
        lastUpdate: 'Last Update',
        closeView: 'Close View',
        noLocationProvided: 'No location provided',
        noDescriptionProvided: 'No detailed description provided for this record.',

        // Support
        howToHelp: "We're here to help you solve your grievances",
        sendMessage: 'Send a Message',
        describeIssue: 'Describe your issue or question...',
        submitRequest: 'Submit Request',
        resources: 'Resources',
        faqs: 'Frequently Asked Questions',

        // About Us
        connectingCitizens: 'Connecting citizens directly with government bodies for faster, transparent, and digital complaint resolution.',
        ourMission: 'Our Mission',
        missionText: 'To empower every citizen with a voice that is heard. We believe technology can bridge the gap between administrative bodies and the public, creating a more responsive governance.',
        transparencyFirst: 'Transparency First',
        transparencyText: 'Real-time tracking and public feedback ensure that every official is accountable. Our system logs every update, making the process tamper-proof and visible.',
        coreValues: 'Core Values',
        citizenCentric: 'Citizen Centric',
        citizenCentricText: 'Designed with the end-user in mind for maximum ease.',
        fastExecution: 'Fast Execution',
        fastExecutionText: 'Strict SLA monitoring for quick grievance resolution.',
        govIntegration: 'Gov. Integration',
        govIntegrationText: 'Seamlessly connected across multiple departments.',
        rightsReserved: 'All rights reserved.',

        // Common
        loading: 'Loading...',
        cancel: 'Cancel',
        save: 'Save',
        edit: 'Edit',
        processing: 'Processing...',
    },
    hi: {
        // Navigation
        home: 'होम',
        fileComplaint: 'शिकायत दर्ज करें',
        trackComplaints: 'शिकायतें ट्रैक करें',
        myProfile: 'मेरी प्रोफ़ाइल',
        settings: 'सेटिंग्स',
        language: 'भाषा',
        helpSupport: 'सहायता और समर्थन',
        aboutUs: 'हमारे बारे में',
        logout: 'लॉग आउट',

        // Profile
        citizen: 'नागरिक',
        totalComplaints: 'कुल शिकायतें',
        resolvedItems: 'हल की गई शिकायतें',
        personalInformation: 'व्यक्तिगत जानकारी',
        permanentAccountDetails: 'स्थायी खाता विवरण',
        phoneNumber: 'फ़ोन नंबर',
        currentAddress: 'वर्तमान पता',
        permanentAddress: 'स्थायी पता',
        permanentInformation: 'स्थायी जानकारी',
        address: 'पता',
        notProvided: 'प्रदान नहीं किया गया',
        noAddressAdded: 'अभी तक कोई पता नहीं जोड़ा गया',
        changeDetail: 'विवरण बदलें',
        note: 'नोट',
        criticalDetailsNote: 'महूर्ण विवरण स्थायी रिकॉर्ड के रूप में बनाए रखे जाते हैं।',

        // Settings
        changeDetails: 'विवरण बदलें',
        accountSettings: 'खाता सेटिंग्स',
        firstName: 'पहला नाम',
        lastName: 'अंतिम नाम',
        secondaryPhone: 'द्वितीयक फ़ोन',
        emailAddress: 'ईमेल पता',
        secondaryEmail: 'द्वितीयक ईमेल',
        optional: 'वैकल्पिक',
        saveChanges: 'परिवर्तन सहेजें',
        changeRestriction: 'केवल हर 45 दिनों में एक बार बदला जा सकता है',
        notifications: 'सूचनाएं',
        privacySecurity: 'गोपनीयता और सुरक्षा',
        changePasswordLink: 'पासवर्ड बदलें →',

        // File Complaint
        fileANewComplaint: 'नई शिकायत दर्ज करें',
        reportIssueToAuthorities: 'जल्द ही अपने स्थानीय अधिकारियों को समस्या की रिपोर्ट करें',
        department: 'विभाग',
        issueCategory: 'समस्या श्रेणी',
        selectDepartment: 'विभाग चुनें',
        selectIssue: 'समस्या चुनें',
        locationAddress: 'स्थान / पता',
        whereDidThisHappen: 'यह कहां हुआ?',
        detailsOptional: 'विवरण (वैकल्पिक)',
        additionalContext: 'कोई अतिरिक्त संदर्भ प्रदान करें...',
        evidencePhoto: 'प्रमाण फोटो',
        uploadImage: 'छवि अपलोड करें',
        submitComplaint: 'शिकायत सबमिट करें',
        complaintSuccessNote: 'आपकी शिकायत की समीक्षा 24 घंटों के भीतर संबंधित अधिकारियों द्वारा की जाएगी।',

        // Track Complaints
        viewStatusOfGrievances: 'अपनी शिकायतों की स्थिति देखें।',
        refresh: 'रिफ्रेश',
        complaintId: 'शिकायत आईडी',
        issueTitle: 'समस्या का शीर्षक',
        status: 'स्थिति',
        assignedOfficer: 'नियुक्त अधिकारी',
        updateDate: 'अपडेट तिथि',
        noComplaintsFound: 'कोई शिकायत नहीं मिली।',
        awaitingAllocation: 'आवंटन की प्रतीक्षा है',
        location: 'स्थान / पता',
        descriptionDetails: 'विवरण / जानकारी',
        lastUpdate: 'पिछला अपडेट',
        closeView: 'व्यू बंद करें',
        noLocationProvided: 'कोई स्थान प्रदान नहीं किया गया',
        noDescriptionProvided: 'इस रिकॉर्ड के लिए कोई विस्तृत विवरण प्रदान नहीं किया गया है।',

        // Support
        howToHelp: 'हम आपकी शिकायतों को हल करने में आपकी मदद करने के लिए यहां हैं',
        sendMessage: 'एक संदेश भेजें',
        describeIssue: 'अपनी समस्या या प्रश्न का वर्णन करें...',
        submitRequest: 'अनुरोध सबमिट करें',
        resources: 'संसाधन',
        faqs: 'अक्सर पूछे जाने वाले प्रश्न',

        // About Us
        connectingCitizens: 'तेजी से, पारदर्शी और डिजिटल शिकायत निवारण के लिए नागरिकों को सीधे सरकारी निकायों से जोड़ना।',
        ourMission: 'हमारा मिशन',
        missionText: 'हर नागरिक को एक ऐसी आवाज के साथ सशक्त बनाना जिसे सुना जाए। हमारा मानना है कि तकनीक प्रशासनिक निकायों और जनता के बीच की दूरी को पाटने में मदद कर सकती है।',
        transparencyFirst: 'पारदर्शिता पहले',
        transparencyText: 'रीयल-टाइम ट्रैकिंग और सार्वजनिक फीडबैक सुनिश्चित करते हैं कि हर अधिकारी जवाबदेह है। हमारा सिस्टम हर अपडेट को लॉग करता है।',
        coreValues: 'मुख्य मूल्य',
        citizenCentric: 'नागरिक केंद्रित',
        citizenCentricText: 'अधिकतम आसानी के लिए अंतिम उपयोगकर्ता को ध्यान में रखकर डिज़ाइन किया गया।',
        fastExecution: 'तेजी से क्रियान्वयन',
        fastExecutionText: 'त्वरित शिकायत निवारण के लिए सख्त SLA निगरानी।',
        govIntegration: 'सरकारी एकीकरण',
        govIntegrationText: 'कई विभागों में निर्बाध रूप से जुड़ा हुआ।',
        rightsReserved: 'सर्वाधिकार सुरक्षित।',

        // Common
        loading: 'लोड हो रहा है...',
        cancel: 'रद्द करें',
        save: 'सहेजें',
        edit: 'संपादित करें',
        processing: 'प्रक्रिया चल रही है...',
    }
};

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('gms_language') || 'en';
    });

    useEffect(() => {
        localStorage.setItem('gms_language', language);
    }, [language]);

    const t = (key) => {
        return translations[language]?.[key] || translations.en[key] || key;
    };

    const changeLanguage = (lang) => {
        if (translations[lang]) {
            setLanguage(lang);
        }
    };

    const value = {
        language,
        changeLanguage,
        t,
        availableLanguages: [
            { code: 'en', name: 'English', nativeName: 'English' },
            { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' }
        ]
    };

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
    return ctx;
}
