this is an svg editor

the document model is SVG. nothing extra. it can directly load SVG files. nothing extra
except possibly metadata.

you can select individual nodes or a group using the side tree view
you can select nodes using a selection rect or clicking or shift clicking
you can move selected nodes around with the mouse
you can edit properties in the properties sheet
when nodes with different sets of properties (different node types) are selected, only the union of the properties is editable.
when nodes with different values for the same properties are selected, neither value is shown and the property sheet indicates
there is a conflict somewhere. changing the value then adjusts them to be the same.

the property sheet only has an abstract model to edit, which then updates the real SVG model.

initial objects

Rsvg = main svg element. version and profile are fixed. width is initially set to 100 x 100
Rrect = main rect element. has height & width and fill which can be absolute numbers or
   percentages or other values. string values are passed directly to the element
Rcircle = main circle element. all values are strings, passed directly to the element (minus string trimming)

PropStore = main storage for properties. does all of the updating


UI

tree view on the left
prop sheet on the right
editor area in the middle
toolbar at the top
status bar at the bottom