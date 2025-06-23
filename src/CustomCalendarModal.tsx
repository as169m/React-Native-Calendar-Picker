// packages/calendar-modal/src/CustomCalendarModal.tsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import moment from "moment";

interface Props {
  visible: boolean;
  onClose: () => void;
  onDateRangeSelect: (start: string, end: string) => void;
  minDate?: string;
  maxDate?: string;
  initialStart?: string;
  initialEnd?: string;
  theme?: any;
}

const SCREEN_WIDTH = Dimensions.get("window").width;

const CustomCalendarModal: React.FC<Props> = ({
  visible,
  onClose,
  onDateRangeSelect,
  minDate,
  maxDate,
  initialStart = "",
  initialEnd = "",
  theme,
}) => {
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [markedDates, setMarkedDates] = useState({});
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    animateModal(visible);
  }, [visible]);

  useEffect(() => {
    if (startDate && endDate) {
      const range = getDateRange(startDate, endDate);
      const newMarked: any = {};
      range.forEach((date) => {
        newMarked[date] = {
          color: "#007BFF",
          textColor: "white",
          startingDay: date === startDate,
          endingDay: date === endDate,
        };
      });
      setMarkedDates(newMarked);
    }
  }, [startDate, endDate]);

  const animateModal = (show: boolean) => {
    Animated.timing(opacityAnim, {
      toValue: show ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const getDateRange = (start: string, end: string): string[] => {
    const range: string[] = [];
    let current = moment(start);
    const last = moment(end);
    while (current.isSameOrBefore(last)) {
      range.push(current.format("YYYY-MM-DD"));
      current = current.add(1, "days");
    }
    return range;
  };

  const onDayPress = (day: DateData) => {
    const selectedDate = day.dateString;
    if (!startDate || (startDate && endDate)) {
      setStartDate(selectedDate);
      setEndDate("");
    } else if (moment(selectedDate).isBefore(startDate)) {
      setStartDate(selectedDate);
    } else {
      setEndDate(selectedDate);
    }
  };

  const handleConfirm = () => {
    if (startDate && endDate) {
      onDateRangeSelect(startDate, endDate);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.modalBackground, { opacity: opacityAnim }]}>
        <View style={styles.modalContainer}>
          <Text style={styles.heading}>Select Date Range</Text>
          <Calendar
            current={startDate || moment().format("YYYY-MM-DD")}
            onDayPress={onDayPress}
            markedDates={markedDates}
            markingType={"period"}
            minDate={minDate}
            maxDate={maxDate}
            enableSwipeMonths
            theme={{
              selectedDayBackgroundColor: "#007BFF",
              todayTextColor: "#FF5722",
              arrowColor: "#007BFF",
              ...theme,
            }}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={!startDate || !endDate}
              style={[
                styles.confirmButton,
                { backgroundColor: startDate && endDate ? "#007BFF" : "#ccc" },
              ]}
            >
              <Text style={styles.confirmText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default CustomCalendarModal;

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    width: SCREEN_WIDTH * 0.9,
    borderRadius: 10,
    padding: 10,
    elevation: 5,
  },
  heading: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelText: {
    color: "red",
    fontSize: 16,
  },
  confirmButton: {
    padding: 10,
    borderRadius: 5,
  },
  confirmText: {
    color: "white",
    fontSize: 16,
  },
});
