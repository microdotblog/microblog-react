//
//  MBHighlightingTextManager.m
//  MicroBlog_RN
//
//  Created by Manton Reece on 4/16/23.
//

#import "MBHighlightingTextManager.h"

#import "MBHighlightingTextView.h"
#import "MBHighlightingTextStorage.h"
#import <React/RCTUIManager.h>

@implementation MBHighlightingTextManager

RCT_EXPORT_MODULE(MBHighlightingTextView)

RCT_EXPORT_VIEW_PROPERTY(onChangeText, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onSelectionChange, RCTBubblingEventBlock)

RCT_CUSTOM_VIEW_PROPERTY(inputAccessoryViewID, NSString, MBHighlightingTextView)
{
  if (json) {
//    NSString* input_id = [RCTConvert NSString:json];
//    NSLog(@"inputAccessoryViewID = %@", input_id);
  }
}

RCT_CUSTOM_VIEW_PROPERTY(fontSize, NSNumber, MBHighlightingTextView)
{
  if (json) {
//    NSInteger font_size = [RCTConvert NSInteger:json];
//    NSLog(@"fontSize = %ld", (long)font_size);
  }
}

RCT_CUSTOM_VIEW_PROPERTY(value, NSString, MBHighlightingTextView)
{
  if (json) {
    if (!self.isTyping) {
      NSString* new_text = [RCTConvert NSString:json];
      if (![[self.textStorage string] isEqualToString:new_text]) {
        self.textView.text = new_text;
      }
    }
  }
}

RCT_CUSTOM_VIEW_PROPERTY(selection, NSString, MBHighlightingTextView)
{
  if (json) {
    NSInteger start_pos = 0;
    NSInteger end_pos = 0;

    NSString* s = [RCTConvert NSString:json];
    if (s.length > 0) {
      // start/end separated by a space, e.g. "0 5"
      NSArray* pieces = [s componentsSeparatedByString:@" "];
      start_pos = [[pieces firstObject] integerValue];
      end_pos = [[pieces lastObject] integerValue];
    }

    self.textView.selectedRange = NSMakeRange(start_pos, end_pos - start_pos);
  }
}

RCT_CUSTOM_VIEW_PROPERTY(autoFocus, BOOL, MBHighlightingTextView)
{
  if (json) {
    BOOL needs_focus = [RCTConvert BOOL:json];
    if (needs_focus) {
      [self.textView becomeFirstResponder];
    }
  }
}

#pragma mark -

+ (CGFloat) preferredTimelineFontSize
{
  UIFont* font = [UIFont preferredFontForTextStyle:UIFontTextStyleBody];
  CGFloat result = font.pointSize;
  return result;
}

+ (CGFloat) preferredPostingFontSize
{
  CGFloat scale = 1.2;
  CGFloat fontsize = round ([self preferredTimelineFontSize] * scale);
  return fontsize;
}

- (UIView *) view
{
  if (UIAccessibilityIsVoiceOverRunning()) {
    // disable highlighting
    self.textStorage = [[NSTextStorage alloc] init];
  }
  else {
    self.textStorage = [[MBHighlightingTextStorage alloc] init];
  }

  // default to screen width
  CGRect r = [UIScreen mainScreen].bounds;
  
  // setup layout and container
  NSLayoutManager* text_layout = [[NSLayoutManager alloc] init];
  CGSize container_size = CGSizeMake (r.size.width, CGFLOAT_MAX);
  NSTextContainer* text_container = [[NSTextContainer alloc] initWithSize:container_size];
  text_container.widthTracksTextView = YES;
  [text_layout addTextContainer:text_container];
  [self.textStorage addLayoutManager:text_layout];

  // make the view
  self.textView = [[MBHighlightingTextView alloc] initWithFrame:r textContainer:text_container];
  self.textView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
  self.textView.translatesAutoresizingMaskIntoConstraints = NO;
  self.textView.delegate = self;
  
  // background color
  BOOL darkmode = NO;
  if (@available(iOS 13.0, *)) {
    darkmode = UITraitCollection.currentTraitCollection.userInterfaceStyle == UIUserInterfaceStyleDark;
  }
  if (darkmode) {
    self.textView.backgroundColor = [UIColor colorWithRed:0.11 green:0.15 blue:0.19 alpha:1.0];
  }
  else {
    self.textView.backgroundColor = [UIColor whiteColor];
  }
  
  // test
//  self.textView.backgroundColor = [UIColor orangeColor];
  
  // default text
  NSString* s = @"";
  NSDictionary* attr_info = @{
    NSFontAttributeName: [UIFont systemFontOfSize:[[self class] preferredPostingFontSize]]
  };
  NSAttributedString* attr_s = [[NSAttributedString alloc] initWithString:s attributes:attr_info];
  self.textView.attributedText = attr_s;
  self.textView.textContainerInset = UIEdgeInsetsMake (10, 5, 10, 5);
  self.textView.font = [UIFont systemFontOfSize:[[self class] preferredPostingFontSize]];
  [self.textStorage setAttributedString:attr_s];

  return self.textView;
}

- (void) textViewDidChange:(UITextView *)textView
{
  // hacky, keep track of whether we're changing text from typing
  self.isTyping = YES;
  [NSTimer scheduledTimerWithTimeInterval:1.0 repeats:NO block:^(NSTimer* timer) {
    self.isTyping = NO;
  }];
  
  // callback to JS
  MBHighlightingTextView* v = (MBHighlightingTextView *)textView;
  [v callTextChanged:textView.text];
}

- (void) textViewDidChangeSelection:(UITextView *)textView
{
  MBHighlightingTextView* v = (MBHighlightingTextView *)textView;
  UITextRange* range = textView.selectedTextRange;
  [v callSelectionChanged:range];
}

@end
